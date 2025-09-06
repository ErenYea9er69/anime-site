import { getUser } from "@/prisma/user";
import pls from "@/utils/request";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import MyListClient from './client';

function convertMinutesToDays(minutes: number) {
  const days = Math.floor(minutes / 1440); // 1440 minutes in a day
  const hours = Math.floor((minutes % 1440) / 60);
  const remainingMinutes = minutes % 60;

  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (remainingMinutes > 0) result += `${remainingMinutes}m`;

  return result.trim();
}

export default async function Page({ params }: { params: { user: string } }) {
  // Get the session first
  const session = await getServerSession(authOptions);
  
  // Get the username from params
  const username = params.user;

  const user = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query ($username: String) {
          User(name: $username) {
            id
            name
            about
            avatar {
              large
            }
            bannerImage
            createdAt
            statistics {
              anime {
                count
                meanScore
                standardDeviation
                minutesWatched
                episodesWatched
                chaptersRead
                volumesRead
              }
            }
          }
        }
      `,
      variables: {
        username,
      },
    }),
  }).then((res) => res.json());

  if (!user.data.User) {
    notFound();
  }

  const [data] = await pls.post(
    "https://graphql.anilist.co/",
    {
      body: JSON.stringify({
        query: `
          query ($username: String, $status: MediaListStatus) {
            MediaListCollection(userName: $username, type: ANIME, status: $status, sort: SCORE_DESC) {
              user {
                id
                name
                about (asHtml: true)
                createdAt
                avatar {
                    large
                }
                statistics {
                  anime {
                      count
                      episodesWatched
                      meanScore
                      minutesWatched
                  }
              }
                bannerImage
                mediaListOptions {
                  animeList {
                      sectionOrder
                  }
                }
              }
              lists {
                status
                name
                entries {
                  id
                  mediaId
                  status
                  progress
                  score
                  media {
                    id
                    status
                    title {
                      english
                      romaji
                    }
                    episodes
                    coverImage {
                      large
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          username,
        },
      }),
    }
  );

  const get = data?.data?.MediaListCollection;
  const sectionOrder = get?.user.mediaListOptions.animeList.sectionOrder;

  if (!sectionOrder) {
    notFound();
  }

  // Handle session data with proper error handling
  let userData = null;
  if (session?.user?.name) {
    try {
      userData = await getUser(session.user.name, false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't throw, just continue with null userData
    }
  }

  const prog = get.lists;

  function getIndex(status: string) {
    const index = sectionOrder.indexOf(status);
    return index === -1 ? sectionOrder.length : index;
  }

  prog.sort(
    (a: { name: string }, b: { name: string }) =>
      getIndex(a.name) - getIndex(b.name)
  );

  const time = convertMinutesToDays(user.data.User.statistics.anime.minutesWatched);

  return (
    <MyListClient
      media={prog}
      sessions={session}
      user={user.data.User}
      time={time}
      userSettings={userData?.setting || null}
    />
  );
}

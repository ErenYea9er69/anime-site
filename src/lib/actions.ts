export async function searchAnime(query: string) {
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        query ($search: String) {
          Page(page: 1, perPage: 10) {
            media(type: ANIME, search: $search) {
              id
              title {
                romaji
                english
              }
              coverImage {
                large
                medium
              }
              bannerImage
              description
              episodes
              status
              genres
              averageScore
              popularity
              season
              seasonYear
              format
              duration
              studios {
                nodes {
                  id
                  name
                }
              }
            }
          }
        }
      `,
      variables: { search: query },
    }),
  });

  const { data } = await response.json();
  return data?.Page?.media || [];
}
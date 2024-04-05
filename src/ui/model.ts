import { Notice, Plugin, requestUrl } from "obsidian";

export const isAuthOk = async (accessToken: string) => {
  const search = new URLSearchParams({
    access_token: accessToken,
  });

  return requestUrl({
    url: "https://gitee.com/api/v5/user?" + search.toString(),
    method: "GET",
    contentType: "application/json",
  })
    .then((res) => {
      return res.json;
    })
    .then((data) => {
      return data.id > 0;
    })
    .catch(() => {
      return false;
    });
};

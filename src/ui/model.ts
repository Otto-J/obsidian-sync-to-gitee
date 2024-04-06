import { Notice, requestUrl } from "obsidian";
import { ref } from "vue";

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
      // console.log(44, data);
      return data;
    })
    .catch(() => {
      return false;
    });
};

interface IOptions {
  // setting
  token: string;
  owner: string;
  repo: string;
  // file info
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  publishTime: string;
  noteId: string;
  body: string;
}

const demoErr = {
  status: 406,
};

type ITimeOptions = "current" | "create_time" | "custom";

export const createPost = async (options: IOptions) => {
  // https://gitee.com/api/v5/repos/{owner}/{repo}/issues/{number}/comments

  const owner = options.owner;
  const repo = options.repo;

  const url = `https://gitee.com/api/v5/repos/${owner}/issues`;

  const _body = {
    access_token: options.token,
    repo: repo,
    title: options.title,
    body: options.body,
    labels: (options.tags as string[]).join(),
  };

  // console.log(url, _body);
  // return;
  return requestUrl({
    url: url,
    method: "POST",
    contentType: "application/json",
    body: JSON.stringify(_body),
  })
    .then((res) => res.json)
    .then((data) => {
      // console.log(45, data);
      return data;
    })
    .catch((err: typeof demoErr) => {
      console.log(err);
      if (err.status === 406) {
        new Notice("Error:406");
      }
      return null;
    });
};
export const updatePost = async (options: IOptions) => {
  const owner = options.owner;
  const repo = options.repo;
  const url = `https://gitee.com/api/v5/repos/${owner}/issues/${options.noteId}`;

  const _body = {
    access_token: options.token,
    repo: repo,
    title: options.title,
    body: options.body,
    labels: (options.tags as string[]).join(),
  };

  console.log(url, _body);

  return requestUrl({
    url: url,
    method: "PATCH",
    contentType: "application/json",
    body: JSON.stringify(_body),
  })
    .then((res) => res.json)
    .then((data) => {
      return data;
    })
    .catch((err: typeof demoErr) => {
      console.log(err);
      if (err.status === 406) {
        new Notice("Error:406");
      } else if (err.status === 404) {
        new Notice("Error:404");
      }
      return null;
    });
};

export const defaultSettings = () => ({
  enable: true,
  isAuth: false,
  owner: "",
  repo: "",
  accessToken: "",
});

export const usePluginSettings = () => {
  // 系统设置
  const settings = ref<Partial<ReturnType<typeof defaultSettings>>>({});

  // 检查插件设置是否正确
  const checkSettingValidate = (
    settings: Partial<ReturnType<typeof defaultSettings>>
  ) => {
    let validate = false;

    if (!settings.enable) {
      new Notice("插件未启用");

      return validate;
    }
    if (!settings.accessToken) {
      new Notice("上传插件未配置用户信息");
      return validate;
    }

    validate = true;
    return validate;
  };

  return {
    settings,
    defaultSettings,
    checkSettingValidate,
  };
};

export const usePostStatus = () => {
  const defaultFileInfo = () => ({
    title: "",
    noteId: "",
    summary: "",
    rawTags: "",
    slug: "",
    publish_time: "",
    create_time: "",
    publishTimeMode: "current" as ITimeOptions,
    content: "",
    frontMatter: {} as Record<string, any>,
  });
  const isLoading = ref(false);

  const fileInfo = ref(defaultFileInfo());

  // 处理 baseInfo 和 config
  const handlePostInfo = (
    title: string,
    content: string,
    frontMatter: Record<string, any>
  ) => {
    // 临时信息
    fileInfo.value.title = title;
    fileInfo.value.content = content;
    fileInfo.value.frontMatter = frontMatter;

    fileInfo.value.rawTags = fileInfo.value.frontMatter?.tags?.join(",") || "";
    fileInfo.value.slug = fileInfo.value.frontMatter?.slug || "";
    fileInfo.value.summary = fileInfo.value.frontMatter?.description || "";
    fileInfo.value.title =
      fileInfo.value.frontMatter?.title || fileInfo.value.title || "";

    // noteID
    fileInfo.value.noteId = fileInfo.value.frontMatter?.noteId_gitee || "";

    // 如果当前 fm 中有 publish_time 设置 timeMode=custom,并设置
    if (fileInfo.value.frontMatter?.publish_time) {
      fileInfo.value.publishTimeMode = "custom";
      fileInfo.value.publish_time = fileInfo.value.frontMatter.publish_time;
    }
  };

  return {
    isLoading,
    fileInfo,
    defaultFileInfo,
    handlePostInfo,
  };
};

<template>
  <div class="modal-bg" style="opacity: 0.85"></div>
  <div class="modal">
    <div class="modal-close-button" @click="closeModal"></div>
    <div class="modal-title">文章上传设置</div>
    <div class="modal-content">
      <!-- title -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">标题 Title</div>
          <div class="setting-item-description">默认读取当前标题</div>
        </div>
        <div class="setting-item-control">
          <input
            v-model="fileInfo.title"
            type="text"
            placeholder="留空表示默认标题"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- slug -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">路径 Slug</div>
          <div class="setting-item-description">留空默认分配</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="fileInfo.slug"
            placeholder="留空表示默认"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- summary -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">摘要 Description</div>
          <div class="setting-item-description">留空默认分配</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="fileInfo.summary"
            placeholder="留空表示默认"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- tags -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">标签 Tags</div>
          <div class="setting-item-description">使用中英文逗号分割</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="fileInfo.rawTags"
            placeholder="留空表示默认"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>

      <!-- 发布日期 -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">发布日期 Publish Time</div>
          <div class="setting-item-description">
            默认读取 publish_time，留空表示当前日期。
            <br />
            支持格式
            <b class="u-pop">YYYY/MM/DD HH:mm:ss</b>
          </div>
        </div>
        <div class="setting-item-control">
          <!-- checkbox -->
          <select class="dropdown" v-model="fileInfo.publishTimeMode">
            <option value="current">使用当前时间</option>
            <option value="create_time">使用 create_time</option>
            <option value="custom">自定义</option>
          </select>
          <input
            :disabled="false"
            type="text"
            v-model="fileInfo.publish_time"
            placeholder="留空表示当前时间"
            spellcheck="false"
            tabindex="3"
          />
        </div>
      </div>
      <!-- noteId -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">关联 Issues ID</div>
          <div class="setting-item-description">
            若填写视为更新文章，留空视为创建文章
          </div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="fileInfo.noteId"
            placeholder="留空表示创建"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
    </div>
    <div class="modal-button-container">
      <button @click="startUpload" class="mod-cta">
        {{ isLoading ? "正在上传" : "开始上传" }}
      </button>
      <button @click="closeModal">取消</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, watchEffect } from "vue";
import { Notice, Modal, TFile, Plugin } from "obsidian";
import {
  createPost,
  usePostStatus,
  usePluginSettings,
  updatePost,
} from "./model";
import { getFrontMatterByFile, updateFrontMatterByFile } from "@/utils";

const props = defineProps<{
  plugin: Plugin;
  modal: Modal;
  file: TFile;
}>();

const { settings, checkSettingValidate } = usePluginSettings();

const { isLoading, fileInfo, defaultFileInfo, handlePostInfo } =
  usePostStatus();

const closeModal = () => {
  fileInfo.value = defaultFileInfo();
  props.modal.close();
};

// 处理 baseInfo 和 config
const handleCurrentInfo = async () => {
  // 临时信息
  const title = props.file.basename;
  const content = await props.file.vault.cachedRead(props.file);
  const frontMatter = await getFrontMatterByFile(props.file, props.plugin.app);

  // 修改 config baseInfo
  handlePostInfo(title, content, frontMatter);
};

onMounted(async () => {
  // 读取配置
  settings.value = await props.plugin.loadData();

  const validate = checkSettingValidate(settings.value);
  if (!validate) {
    return;
  }

  // 读取文章内容和相关信息
  handleCurrentInfo();
});

// 监听发布时间模式
watchEffect(() => {
  if (fileInfo.value.publishTimeMode === "create_time") {
    const ctime =
      fileInfo.value.frontMatter?.create_time ?? props.file.stat.ctime;
    const current = new Date(ctime).toLocaleString();
    fileInfo.value.publish_time = current;
  } else if (fileInfo.value.publishTimeMode === "current") {
    fileInfo.value.publish_time = new Date().toLocaleString();
  } else if (fileInfo.value.publishTimeMode === "custom") {
    fileInfo.value.publish_time = "";
  } else {
    console.log("未尽事宜", fileInfo.value.publishTimeMode);
  }
});

const handleCreatePost = async ({
  content,
  title,
  summary,
  tags,
  slug,
}: any) => {
  const res = await createPost({
    token: settings.value.accessToken!,
    owner: settings.value.owner!,
    repo: settings.value.repo!,
    title: title,
    slug: slug,
    summary: summary,
    tags: tags,
    publishTime: fileInfo.value.publish_time,
    noteId: fileInfo.value.noteId,
    body: content,
  });
  // console.log(46, res);
  const id = res.number as string;

  if (res) {
    new Notice("上传成功");
    return id;
  } else {
    new Notice("上传失败");
    return null;
  }
};

const handleUpdatePost = async ({
  content = "",
  title = "",
  summary = "",
  tags = [] as string[],
  slug = "",
  noteId = "",
}) => {
  // 更新文章
  const res = await updatePost({
    token: settings.value.accessToken!,
    owner: settings.value.owner!,
    repo: settings.value.repo!,
    title: title,
    slug: slug,
    summary: summary,
    tags: tags,
    publishTime: fileInfo.value.publish_time,
    noteId: noteId,
    body: content,
  });
  const id = res.number as string;
  console.log("update post", res);

  if (res) {
    new Notice("更新成功");
    return id;
  } else {
    new Notice("更新失败");
    return null;
  }
};

const handleSubmit = async ({
  content = "",
  title = "",
  summary = "",
  tags = [] as string[],
  slug = "",
  noteID = "",
}) => {
  const isUpdate = !!noteID;

  // 如果发布时间是自定义，但是内容为空，设置当前时间
  if (
    fileInfo.value.publishTimeMode === "custom" &&
    !fileInfo.value.publish_time
  ) {
    fileInfo.value.publish_time = new Date().toLocaleString();
  }

  if (isUpdate) {
    // 走更新
    const id = await handleUpdatePost({
      content,
      title,
      summary,
      tags,
      slug,
      noteId: noteID,
    });
    // const id = "I9GNGQ";

    if (!id) {
      console.log("更新失败 handleUpdatePost");
      return;
    }
  } else {
    // 走创建
    const id = await handleCreatePost({
      content,
      title,
      summary,
      tags,
      slug,
    });
    // const id = "I9GNGQ";

    if (id) {
      noteID = id;
    }
  }

  const ctime =
    fileInfo.value.frontMatter?.create_time ?? props.file.stat.ctime;

  console.log(
    "current file frontmatter",
    JSON.parse(JSON.stringify(fileInfo.value.frontMatter))
  );

  const meta = {
    slug: slug,
    description: summary,
    // tags 要去掉 post
    tags: tags.filter((i) => i !== "post"),
    noteId_gitee: noteID,

    create_time: new Date(ctime).toLocaleString(),
    update_time: new Date().toLocaleString(),
    publish_time: fileInfo.value.publish_time
      ? new Date(fileInfo.value.publish_time).toLocaleString()
      : new Date().toLocaleString(),
  };
  console.log("update frontmatter meta", meta);

  await updateFrontMatterByFile(props.file, props.plugin.app, meta);

  closeModal();
};

const startUpload = async () => {
  if (isLoading.value) {
    new Notice("正在上传中");
    return;
  }

  if (
    !settings.value.accessToken ||
    !settings.value.owner ||
    !settings.value.repo
  ) {
    new Notice("请先配置");
    return;
  }

  isLoading.value = true;
  let tags = fileInfo.value.rawTags.split(/[,，]/);
  // 转 set 去重
  tags = Array.from(new Set(tags)).filter((i) => i);
  if (!tags.some((i) => i === "post")) {
    tags.unshift("post");
  }

  const currentConfig = {
    content: fileInfo.value.content,
    title: fileInfo.value.title,
    summary: fileInfo.value.summary,
    tags: tags,
    slug: fileInfo.value.slug,
    noteID: fileInfo.value.noteId,
  };
  // 1. 上传
  await handleSubmit(currentConfig);
  isLoading.value = false;
};
</script>

<style></style>

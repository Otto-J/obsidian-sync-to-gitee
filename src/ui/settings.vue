<template>
  <h2>基础</h2>
  <!-- enable -->
  <div class="setting-item mod-toggle">
    <div class="setting-item-info">
      <div class="setting-item-name">启用 Enable</div>
      <div class="setting-item-description">
        若关闭插件不生效<br />
        Turn off will disable
      </div>
    </div>

    <div class="setting-item-control">
      <div
        class="checkbox-container"
        :class="settings.enable ? 'is-enabled' : ''"
      >
        <input type="checkbox" v-model="settings.enable" tabindex="0" />
      </div>
    </div>
  </div>
  <h2>信息</h2>
  <!-- username -->
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">gitee access-token</div>
      <div class="setting-item-description">
        如不清楚 Token 请访问
        <a tabindex="1" href="https://blog.ijust.cc/play-xlog-02">Get Help</a>
      </div>
    </div>
    <div class="setting-item-control">
      <input
        v-model="settings.accessToken"
        type="text"
        placeholder="请输入 access-token"
        spellcheck="false"
        tabindex="2"
      />
      <button class="mod-cta" tabindex="3" @click="testConnect">
        连接测试
      </button>
      <span v-if="settings.isAuth">ok</span>
      <span v-else>err</span>
    </div>
  </div>

  <div class="setting-item-control" style="margin-top: 18px">
    <button @click="settings = defaultSettings()">重置配置</button>
    <button class="mod-cta" @click="save">保存配置</button>
  </div>
</template>
<script lang="ts" setup>
import { Notice, Plugin, requestUrl } from "obsidian";
import { onMounted, ref } from "vue";
import { isAuthOk } from "./model";

const props = defineProps<{
  plugin: Plugin;
}>();

const defaultSettings = () => ({
  name: "",
  enable: true,
  isAuth: false,
  accessToken: "228a33ca4192f43957b97590fde72c3f",
});
const settings = ref(defaultSettings());

const testConnect = async () => {
  const valid = await isAuthOk(settings.value.accessToken);
  if (valid) {
    new Notice("连接成功");
    settings.value.isAuth = true;
  } else {
    new Notice("连接失败");
    settings.value.isAuth = false;
  }
};
const save = async () => {
  const newSeeting = {
    // ...currentSetting.value,
    ...settings.value,
  };
  await props.plugin.saveData(newSeeting);
  new Notice("保存成功");
};

const fetchData = () => {
  const token = "";
  requestUrl({
    url: "/",
    method: "GET",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(({ json }) => {
    return json;
  });
};
// fetchData()

onMounted(async () => {
  if (props.plugin) {
    const _currentSetting =
      (await props.plugin.loadData()) ?? defaultSettings();
    settings.value = _currentSetting;
  }
});
</script>

<style scoped>
input[type="checkbox"] {
  width: 100%;
  height: 100%;
}
</style>

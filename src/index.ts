import { Notice, Plugin, TFile, TFolder } from "obsidian";
import { SampleSettingTab } from "./setting";
import { MyPublishModal } from "./model";
// import { MyPublishModal } from "./model";

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: "这是默认值",
};

// 核心
export default class MyPlugin extends Plugin {
  settings!: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new SampleSettingTab(this.app, this));

    // 左侧 sidebar 具体文件单击右键
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFolder) {
          // 一定进不来，为了 ts 不报错
          return;
        }

        if (file instanceof TFile) {
          const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(
            file.extension
          );

          if (isImg) {
            // 暂不处理
          } else {
            menu.addItem((item) => {
              item.setTitle("上传此文件到 gitee").onClick(async () => {
                new MyPublishModal(this.app, this, file).open();
              });
            });
          }
        }
      })
    );

    // this.addRibbonIcon("dice", "悬浮展示1", (evt: MouseEvent) => {
    //   console.log(evt);
    //   // this.openMapView();
    // });

    // 在这里注册命令 This adds a simple command that can be triggered anywhere
    // this.addCommand({
    //   id: "xxx-id",
    //   name: "注册命令中文名",
    //   callback: () => {
    //     new Notice("注册命令");
    //   },
    // });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

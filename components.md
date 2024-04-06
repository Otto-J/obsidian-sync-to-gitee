# obsidian components doc

## 标题

```html
<h2>xxx</h2>
```

## form item

```html
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
```

## checkbox

```html
<div class="checkbox-container" :class="settings.enable ? 'is-enabled' : ''">
  <input type="checkbox" v-model="settings.enable" tabindex="0" />
</div>
```

## input

```html
<input
  v-model="settings.name"
  type="password"
  placeholder="请输入 token"
  spellcheck="false"
  tabindex="2"
/>
```

## button

- `class="mod-cta"` type='primary'
- 不填写就是 plain

```html
<button class="mod-cta" tabindex="3">连接测试</button>
```

## select

```html
<select class="dropdown" v-model="settings.name">
  <option
    :value="item.value"
    v-for="item of []"
    :key="item.value"
    :label="item.name"
  ></option>
</select>
```

## modal

```html
<div class="modal-bg" style="opacity: 0.85"></div>
<div class="modal">
  <div class="modal-close-button" @click="closeModal"></div>
  <div class="modal-title">title</div>
  <div class="modal-content">
    <!-- title -->
    <div class="setting-item">
      <div class="setting-item-info">
        <div class="setting-item-name">标题 Title</div>
        <div class="setting-item-description">默认读取当前标题</div>
      </div>
      <div class="setting-item-control">
        <input
          type="text"
          placeholder="留空表示默认标题"
          spellcheck="false"
          tabindex="2"
        />
      </div>
    </div>
  </div>
  <div class="modal-button-container">
    <button class="mod-cta">{{ isLoading ? "正在上传" : "开始上传" }}</button>
    <button @click="closeModal">取消</button>
  </div>
</div>
```

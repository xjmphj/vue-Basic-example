<template>
  <div
    ref="customUpload"
    @click="handleFocus"
    v-click-outside="handleBlur"
    class="custom-upload-box"
  >
    <el-popover
      placement="bottom-start"
      trigger="click"
      popper-class="uploadPopover"
      :show-arrow="false"
      width="320"
      :hide-after="50"
      v-if="!drag"
      :visible="popVisible"
    >
      <template #reference>
        <el-input placeholder=" " class="uploadSelect">
          <template #prefix>
            <el-upload
              class="upload-demo"
              :action="action"
              :multiple="multiple"
              :limit="limit"
              :file-list="fileList"
              :accept="accept"
              :before-upload="beforeAvatarUpload"
              :http-request="httpRequestup"
              :show-file-list="false"
              :disabled="isDiasble || disabled"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="limitTooltip"
                placement="top"
                :visible="uploadBtnVisible"
              >
                <el-button
                  class="uploadBtn"
                  :class="{ setDisabled: isDiasble }"
                  @mouseenter="handleBtnEnter('input')"
                  @mouseleave="handleBtnLeave"
                >
                  <svg-icon
                    name="uploadAdd"
                    className="plue"
                    :color="isDiasble ? '#94BFFF' : '#165DFF'"
                  />
                </el-button>
              </el-tooltip>
            </el-upload>
            <svg-icon
              :name="getSvg(item)"
              className="uploadSvg"
              v-for="item in fileListLength"
              :key="item"
            />
            <span v-if="fileList.length >= 5" style="color: #627189; line-height: 20px"> 5+ </span>
          </template>
          <template #suffix>
            <el-icon class="arrow" :class="{ isRotate: popVisible }"><ArrowDown /></el-icon>
          </template>
        </el-input>
      </template>
      <el-scrollbar :max-height="228" tag="ul">
        <li v-for="(item, index) in fileList" :key="item.code" class="uploadList">
          <div class="uploadListItem">
            <div class="uploadMess">
              <svg-icon :name="getSvg(getExtension(item.name))" className="uploadSvg" />
              <span
                class="subString"
                :class="{ alink: isPdf(item.name) || isImage(item.name) }"
                @click.stop="previewFile(item)"
              >
                {{ item.name }}
              </span>
            </div>
            <div class="uploadListHandle">
              <el-icon @click.stop="downloadFileWidthCode(item)" class="handleIcon">
                <svg-icon name="uploadDownload" />
              </el-icon>
              <el-divider direction="vertical" />
              <el-icon
                v-if="!viewMode && !disabled"
                @click.stop="deleteMinioFile(index, item)"
                class="handleIcon"
              >
                <svg-icon name="uploadDelete" />
              </el-icon>
            </div>
          </div>
        </li>
      </el-scrollbar>

      <template v-if="fileList.length == 0">
        <p class="placeText">暂无文件</p>
      </template>
      <el-upload
        v-if="!drag && !disabled"
        class="upload-select"
        :action="action"
        :multiple="multiple"
        :limit="limit"
        :file-list="fileList"
        :accept="accept"
        :before-upload="beforeAvatarUpload"
        :http-request="httpRequestup"
        :show-file-list="false"
        :disabled="isDiasble"
      >
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="limitTooltip"
          placement="top"
          :visible="selectBtnVisible"
        >
          <dashed-line-button
            type="dashed_line"
            plain
            class="selectUploadBtn"
            :class="{ selectDisabled: isDiasble }"
            style="width: 100%"
            @mouseenter="handleBtnEnter('select')"
            @mouseleave="handleBtnLeave"
          >
            <svg-icon
              name="uploadAdd"
              style="width: 12px; height: 12px; margin-right: 4px"
              :color="isDiasble ? disabledColor : iconColor"
              :hoverColor="isDiasble ? disabledColor : iconHoverColor"
            />添加本地文件
          </dashed-line-button>
        </el-tooltip>
      </el-upload>
      <p class="placeText">文件大小：{{ fileSize }}M</p>
    </el-popover>
    <!-- 图片预览 -->
    <image-previewer
      v-if="currentImageUrl && imageUrlList.length"
      teleported
      hide-on-click-modal
      :initialIndex="initialIndex"
      :urlList="imageUrlList"
      @close="closeImageViewer"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, toRefs, watch, computed, nextTick, onUnmounted } from 'vue';
import { RMessage } from '@/utils';
import type { UploadProps } from 'element-plus';
// eslint-disable-next-line
import { ArrowDown } from '@element-plus/icons-vue';
import { isImage, isPdf, saveFile } from '@/utils/utils';
import { getExtension } from '@core/views/custom-page/preview/util/utils';
import ImagePreviewer from '@/components/image-previewer/index.vue';
import { ClickOutside as vClickOutside } from 'element-plus';
import {
  configAttachUpload,
  configAttachDownload,
  configAttachRemove,
  EBizType,
  INewFile,
} from '@/api/common/common';
import { cloneDeep } from 'lodash';
interface IFlieListItem {
  originalName?: string;
  name?: string;
  url: string;
  attachSize?: string;
  upstate?: string;
  extension?: string;
}
const emit = defineEmits(['input', 'change', 'update:modelValue', 'deleteImg']);
const props = withDefaults(
  defineProps<{
    action?: string;
    accept?: string;
    drag?: boolean;
    showFileList?: boolean;
    fileSize?: number;
    multiple?: boolean;
    limit?: number;
    disabled?: boolean;
    display?: boolean;
    listType?: string;
    modelValue: any[];
    viewMode?: boolean;
    confirmDelete?: boolean;
    bizType?: EBizType; // 业务类型
    beforeAvatarUploadFn?: noopPromise;
    beforeDeleteFn?: noopPromise;
  }>(),
  {
    action: '',
    accept: '',
    drag: false,
    showFileList: true,
    fileSize: 10,
    multiple: false,
    disabled: false,
    display: false,
    listType: '',
    modelValue: () => [],
    confirmDelete: false,
    bizType: EBizType.page,
  }
);
const popVisible = ref(false);
const { modelValue, viewMode, limit } = toRefs(props);
const fileList = ref<INewFile[]>([]);
const imageUrlListNew = ref();
// 由于createObjectURL需要手动释放，在此手动释放
const modelValueCache: INewFile[] = [];
const getImageUrlList = (list: INewFile[]) => {
  const filterList = list.filter((item) => isImage(item.name));
  const promiseList = [];
  for (let i = 0; i < filterList?.length; i++) {
    const itemI = filterList[i];
    const hasOne = modelValueCache.find((item) => item.code === itemI.code);
    if (!hasOne) {
      const obj = {
        name: itemI.name,
        code: itemI.code,
        http: configAttachDownload(itemI.code),
      };
      promiseList.push(obj);
    }
  }
  if (promiseList?.length) {
    Promise.all(promiseList.map((item) => item.http)).then((res) => {
      for (let i = 0; i < res.length; i++) {
        const obj = {
          name: promiseList[i].name,
          code: promiseList[i].code,
          url: URL.createObjectURL(res[i]),
        };
        modelValueCache.push(obj);
      }
      const imageUrlList: INewFile[] = [];
      for (let i = 0; i < filterList?.length; i++) {
        const itemI = filterList[i];
        const hasOne = modelValueCache.find((item) => item.code === itemI.code);
        if (hasOne) {
          imageUrlList.push(hasOne);
        }
      }
      imageUrlListNew.value = imageUrlList;
    });
  }
};
watch(
  () => modelValue.value,
  (newValue) => {
    if (newValue && newValue.length > 0) {
      fileList.value = newValue;
      getImageUrlList(newValue);
    } else {
      fileList.value = [];
      imageUrlListNew.value = [];
    }
  },
  {
    immediate: true,
  }
);
const fileListLength = computed(() => {
  return fileList.value.slice(0, 4).map((item) => getExtension(item.name));
});
const isDiasble = computed(() => {
  return fileList.value.length >= limit.value;
});
const imageUrlList = computed(() => {
  return (imageUrlListNew.value as Array<IFlieListItem>)
    .filter((file) => (file.url ? isImage(file.name) : false))
    .map((file) => file.url);
});
const currentImageUrl = ref('');
const initialIndex = computed(() => {
  const atIndex = imageUrlList.value.findIndex((url) => url === currentImageUrl.value);
  return atIndex > -1 ? atIndex : 0;
});
// 文件预览
const previewFile = (fileNew: INewFile) => {
  if (!fileNew || !fileNew.code) return;
  const file = imageUrlListNew.value.find((item) => item.code === fileNew.code);
  if (file && isImage(file.name)) {
    closeImageViewer();
    nextTick(() => {
      currentImageUrl.value = file.url;
    });
  } else {
    downloadFileWidthCode(fileNew);
  }
};
const closeImageViewer = () => {
  currentImageUrl.value = '';
};
const httpRequestup: any = async (options: any) => {
  const fileName = options?.file?.name || '未命名';
  let res = null;
  try {
    res = await configAttachUpload({ file: options.file }, props.bizType);
  } catch (error) {
    console.log(error);
  }
  if (res) {
    const fileObj: INewFile = {
      name: fileName,
      code: res.data,
    };
    const list = cloneDeep(fileList.value);
    list.push(fileObj);
    emit('update:modelValue', list);
  }
};
const beforeAvatarUpload: UploadProps['beforeUpload'] = async (rawFile: any) => {
  let isSize = true;
  if (props.fileSize) {
    isSize = rawFile.size < props.fileSize * 1024 * 1024;
  } else {
    isSize = rawFile.size < 3 * 1024 * 1024; // 本需求中默认为3M
  }
  if (!isSize) {
    RMessage.error(`上传文件大小不能超过${props.fileSize ? props.fileSize : 10}M!`);
    return false;
  }
  const extension = getExtension(rawFile.name);
  if (props.accept && props.accept.indexOf(extension) === -1) {
    RMessage.error('上传附件格式错误');
    return false;
  }
  // 不为空且有上传前回调参数的才进行校验
  if (modelValue.value?.length && props.beforeAvatarUploadFn) {
    let flag = await props.beforeAvatarUploadFn();
    if (!flag) {
      return false;
    }
  }
  return true;
};
const downloadFileWidthCode = async (fileObj: INewFile) => {
  let res = null;
  try {
    res = await configAttachDownload(fileObj.code);
  } catch (error) {
    console.log(error);
  }
  saveFile(res, fileObj.name);
};
const deleteMinioFile = async (index: number, fileObj: INewFile) => {
  if (props.beforeDeleteFn) {
    let flag = await props.beforeDeleteFn();
    if (!flag) {
      return;
    }
  }
  let res = null;
  try {
    res = await configAttachRemove(fileObj.code);
  } catch (error) {
    console.log(error);
  }
  if (res?.success && res?.code === 200) {
    const list = cloneDeep(fileList.value);
    list.splice(index, 1);
    emit('update:modelValue', list);
    const cacheIndex = modelValueCache.findIndex((item) => item.code === fileObj.code);
    if (cacheIndex !== -1) {
      URL.revokeObjectURL(modelValueCache[cacheIndex].url);
      modelValueCache.splice(cacheIndex, 1);
    }
  }
};
// 获取icon
const suffixList = ['doc', 'xlsx', 'ppt', 'txt', 'zip', 'jpg', 'pdf'];
const getSvg = (item: string) => {
  let name = 'Default';
  if (suffixList.includes(item)) {
    name = item;
  }
  return 'upload' + name;
};

// 文件个数限制文字提示
const limitTooltip = computed(() => {
  return `仅支持上传${limit.value}个文件`;
});
// 控制上传列表下拉框
const handleBlur = () => {
  popVisible.value = false;
};
const handleFocus = () => {
  popVisible.value = !popVisible.value;
};
// 控制上传文件个数下拉框
const uploadBtnVisible = ref(false);
const selectBtnVisible = ref(false);
// ICON颜色
const disabledColor = '#94BFFF';
const iconColor = ref('#364059');
const iconHoverColor = '#4080FF';
const handleBtnEnter = (type: string) => {
  if (type == 'input') {
    uploadBtnVisible.value = fileList.value.length >= limit.value;
  } else {
    selectBtnVisible.value = fileList.value.length >= limit.value;
    iconColor.value = iconHoverColor;
  }
};
const handleBtnLeave = () => {
  uploadBtnVisible.value = false;
  selectBtnVisible.value = false;
  iconColor.value = '#364059';
};
// 保留原来的功能，如需使用，请按实际情况修改
const confirmDelete = (fileObj: INewFile) => {
  configAttachRemove(fileObj.code);
};
defineExpose({
  confirmDelete,
});
onUnmounted(() => {
  for (let i = 0; i < modelValueCache?.length; i++) {
    URL.revokeObjectURL(modelValueCache[i].url);
  }
});
</script>

<style scoped lang="scss">
.custom-upload-box {
  width: 100%;
  max-width: 416px;
  line-height: initial;
}
:deep(.uploadBtn) {
  width: 20px;
  height: 20px;
  background: var(--color-shallow-hover);
  border-radius: 1px 1px 1px 1px;
  padding: 0;
  min-width: 20px;
  margin-right: 4px;
  border-color: var(--color-shallow-hover);
  .plue {
    width: 12px;
    height: 12px;
  }

  &:hover {
    background: var(--color-text-disabled);
    border-color: var(--color-text-disabled);
  }
}
.uploadBtn.is-disabled {
  background: var(--color-shallow-hover);
  border-color: var(--color-shallow-hover);
  pointer-events: all;
  .svg-icon {
    color: #000;
  }
  .plue {
    fill: #94bfff;
  }
}
.uploadList {
  padding: 0 8px;
  height: 28px;

  .uploadListItem {
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    // .subString {
    //   margin-right: 10px;
    //   vertical-align: top;
    // }

    .uploadListHandle {
      width: 48px;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .el-divider--vertical {
        margin: 0 4px;
      }
      .handleIcon {
        cursor: pointer;
        width: 18px;
        height: 18px;
        .svg-icon {
          width: 14px;
          height: 14px;
          color: var(--el-text-color-secondary);
        }
        &:hover {
          background-color: var(--el-border-color-light);
          border-radius: 2px;
        }
      }
    }

    .uploadMess {
      width: calc(100% - 56px);
      height: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-right: 8px;

      .subString {
        width: calc(100% - 24px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--color-primary);
      }

      .uploadSvg {
        width: 20px;
        height: 20px;
        margin-right: 4px;
      }
    }
  }

  .uploadListItem:hover {
    background-color: #f5f7fa;
    border-radius: 2px;
    cursor: pointer;
  }
}

.uploadSvg {
  width: 20px;
  height: 20px;
  margin-right: 4px;
}

.upload-select {
  width: 100%;
  padding: 0 8px;
  box-sizing: border-box;
  margin-top: 4px;
  :deep(.el-upload) {
    width: 100%;
  }
  :deep(.el-button) {
    &:focus {
      background-color: var(--el-button-bg-color);
      border: var(--el-border);
      border-style: dashed;
      color: var(--el-text-color-primary);
    }
    &:active {
      background-color: var(--el-button-bg-color);
      border: var(--el-border);
      border-style: dashed;
      color: var(--el-text-color-primary);
    }
    &:hover {
      color: var(--el-button-hover-text-color);
      background-color: var(--el-button-hover-bg-color);
      outline: 0;
      border-color: var(--el-button-hover-border-color);
    }
  }
  :deep(.el-button.is-disabled) {
    color: var(--el-color-primary-light-5);
    background-color: var(--el-bg-color);
    border-color: var(--el-color-primary-light-5);
  }
  .selectDisabled {
    color: var(--el-color-primary-light-5);
    background-color: var(--el-bg-color);
    border-color: var(--el-color-primary-light-5);
    &:hover {
      cursor: not-allowed;
      color: var(--el-color-primary-light-5);
      background-color: var(--el-bg-color);
      border-color: var(--el-color-primary-light-5);
    }
  }
}

.setDisabled {
  &:hover {
    cursor: not-allowed;
    background: var(--color-shallow-hover);
    border-color: var(--color-shallow-hover);
  }
}
.uploadPopover {
  .el-select-dropdown__item.hover,
  .el-select-dropdown__item:hover {
    background-color: #fff;
    color: var(--el-text-color-regular);
  }
}

.uploadSelect {
  :deep(.el-input__wrapper) {
    padding: 1px 12px 1px 4px;
  }

  .upload-demo {
    display: flex;
    flex-direction: row;
  }
}
.placeText {
  font-weight: normal;
  color: #8b99ae;
  text-align: center;
  font-size: 12px;
  margin: 8px 0 0 0;
}
.arrow {
  color: var(--el-text-color-secondary);
  transition: transform 0.3s;
  transform: rotateZ(0);
}
.isRotate {
  transform: rotate(180deg);
}
</style>

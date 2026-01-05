<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <template v-if="hasOneShowingChild(item.children, item)">
      <el-menu-item 
        :index="resolvePath(onlyOneChild.path)" 
        :class="{'submenu-title-noDropdown': !isNest}"
      >
        <el-icon v-if="onlyOneChild.meta.icon || (item.meta && item.meta.icon)">
          <component :is="onlyOneChild.meta.icon || (item.meta && item.meta.icon) || 'Menu'" />
        </el-icon>
        <span v-if="onlyOneChild.meta.title" slot="title">{{ onlyOneChild.meta.title }}</span>
      </el-menu-item>
    </template>

    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon || 'Menu'" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
      </template>

      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import path from 'path-browserify'
import { isExternal } from '@/utils/validate'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  }
})

const onlyOneChild = computed(() => {
  const children = props.item.children
  if (children && children.length === 1 && !children[0].alwaysShow) {
    return {
      ...children[0],
      path: path.resolve(props.item.path, children[0].path),
      meta: { ...props.item.meta, ...children[0].meta }
    }
  }
  return { ...props.item, path: '' }
})

const hasOneShowingChild = (children = [], parent) => {
  const showingChildren = children.filter(item => {
    if (item.meta && item.meta.hidden) {
      return false
    } else {
      return true
    }
  })

  // 当只有一个子路由且父路由总是显示时，只显示父路由
  if (showingChildren.length === 1 && !parent.alwaysShow) {
    return true
  }

  return false
}

const resolvePath = (routePath) => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return path.resolve(props.basePath, routePath)
}
</script>
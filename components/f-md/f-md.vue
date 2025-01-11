<template>
	<view class="markdown-body" :class="_class">
		<rich-text v-if="nodes && nodes.length" space="nbsp" :nodes="nodes" @itemclick="trOnclick"/>
		<slot></slot>
	</view>
</template>

<script>
import mdUtil from "./js/md-util";

export default {
	props: {
		content: {
			type: String,
			default: ""
		},
		isStreaming: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
		}
	},
	computed: {
		nodes() {
			if (!this.content) {
				this.content = "";
			}
			const response = mdUtil.render(this.content);
			this.copyCode = response.copyCode;
			return response.nodes;
		},
		_class() {
			let cls = "";
			if (this.isStreaming) {
				cls += "show-cursor ";
			}
			cls += this.sys_theme;
			return cls;
		},
	},
	created() {
	},
	methods: {
		trOnclick(e) {
			let {attrs} = e.detail.node;
			let {"code-data-index": codeDataIndex, "class": className, "code-data-href": codeDataHref} = attrs;
			const code = this.copyCode[codeDataIndex];
			let copyFlag = false;
			if (Array.isArray(className)) {
				for (let cls of className) {
					if (cls === "copy-btn") {
						copyFlag = true;
						break;
					}
				}
			} else if (className === "copy-btn") {
				copyFlag = true;
			}

			if (copyFlag && code) {
				this.copy(code);
			} else if (codeDataHref) {
				// #ifdef H5
				// 如果是以pages开头的，则跳转到 内部页面
				if (codeDataHref.startsWith("/pages")) {
					uni.$u.route(codeDataHref);
				} else {
					window.open(codeDataHref, '_blank');
				}
				// #endif
				// #ifndef H5
				uni.navigateTo({
					url: `/pages/webview/webview?url=${codeDataHref}`
				});
				// #endif
			}
		},
		copy(data) {
			let flag = false;
			uni.setClipboardData({
				data: data,
				showToast: false,
				success() {
					flag = true;
				}
			})
			uni.showToast({
				title: '复制' + (flag ? '成功' : "失败"),
				icon: 'none'
			});
		},
	}
}
</script>

<style lang="scss">
@import './css/highlight';
/* #ifndef MP-WEIXIN */
@import './css/markdown';
/* #endif */
/* #ifdef MP-WEIXIN */
@import './css/markdown-mp';
/* #endif */

.rich-text :last-child {
	margin-bottom: 0;
}

.rich-text :first-child {
	margin-top: 0;
}
</style>

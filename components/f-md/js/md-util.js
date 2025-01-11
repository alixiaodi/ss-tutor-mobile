// 引入MarkdownIt库，用于将Markdown文本转换为HTML
import MarkdownIt from 'markdown-it';
// 引入highlight.js库，用于代码高亮显示
import hljs from 'highlight.js';

// 定义一个对象，用于存储代码段的副本
const COPY_CODE = {};
// 定义一个HTML片段，用于创建复制代码的按钮
const COPY_CODE_HTML_PREV = "<a class=\"copy-btn text-df\" code-data-index=\"";

// 初始化MarkdownIt实例，配置一些选项
const md = new MarkdownIt({
    html: true, // 允许在Markdown中使用HTML标签
    linkify: true, // 自动将文本中的URL转换为链接
    typographer: true, // 启用一些语言中立的替换和引号美化
    highlight: function (code, lang) { // 配置代码高亮的回调函数
        let html;
        // #ifndef MP-WEIXIN
        // 生成一个随机的代码索引
        const codeIndex = Date.now() + Math.floor(Math.random() * 10000000);
        // 将代码存储在COPY_CODE对象中
        COPY_CODE[codeIndex] = code;
        // 将复制按钮的HTML片段添加到html变量中
        html = `${COPY_CODE_HTML_PREV + codeIndex}">copy</a>`;
        // #endif

        // 计算代码的行数
        const linesLength = code.split(/\n/).length - 1;
        // 生成行号的HTML片段
        let linesNum = '<span class="line-numbers-rows" aria-hidden="true">';
        for (let index = 0; index < linesLength; index++) {
            linesNum = linesNum + '<span></span>';
        }
        linesNum += '</span>';
        // 如果有行号，添加语言标签和图标
        if (linesLength) {
            html += '<b class="name text-df">' + lang + '</b><b class="img"/>';
        }
        // 如果lang是"vue"，则将其修改为"html"
        lang = lang === "vue" ? "html" : lang;
        // 如果提供了语言并且highlight.js支持该语言，则尝试高亮代码
        if (lang && hljs.getLanguage(lang)) {
            try {
                // 使用highlight.js高亮代码
                const preCode = hljs.highlight(code, {language: lang, ignoreIllegals: true }).value;
                // 返回高亮后的代码HTML片段
                return `<pre class="hljs">${html}${linesNum}<code class="language-${lang}">${preCode}</code></pre>`;
            } catch (error) {
                console.log(error)
            }
        }

        // 如果高亮失败，则转义代码中的HTML字符
        const preCode = md.utils.escapeHtml(code);
        // 返回普通的代码HTML片段
        return `<pre class="hljs">${html}${linesNum}<code class="language-${lang}">${preCode}</code></pre>`;
    }
});

// 定义一个函数，用于渲染Markdown文本
function render(streamMsg) {
    let htmlString;
    // 检查代码块的数量是否为奇数，并且不是以三个连续的反引号开头或结尾
    if (streamMsg.split("```").length % 2 && !streamMsg.startsWith("```") && !streamMsg.endsWith("```")) {
        // 如果是，将Markdown文本转换为HTML，并在末尾添加一个光标
        htmlString = md.render(streamMsg + '  <span class="cursor">|</span>');
    } else {
        // 否则，直接将Markdown文本转换为HTML
        htmlString = md.render(streamMsg);
        // 并在代码块的末尾添加一个光标
        htmlString = htmlString.replace(/(<\/code><\/pre>[^<]*)$/,
            "<span class=\"cursor cursor-color\">|</span></code></pre>");
    }
    let copyCode;
    // #ifndef MP-WEIXIN
    // 获取复制代码的数据
    copyCode = getCopyCode(htmlString);
    // 替换HTML中的链接，为其添加特定的类
    htmlString = htmlString.replace(/<a href="/g, '<a class="clickable ui-TC-Main" code-data-href="');
    // #endif
    // #ifdef MP-WEIXIN
    // 对微信小程序特殊处理
    htmlString = mpWeiXinSpecialHandle(htmlString);
    // #endif
    // 替换 p 标签中的 \n 为 <br/>
    htmlString = htmlString.replace(/<p>(.*?)<\/p>/gis, function(match, p1) {
        // 将匹配到的<p>内容中的\n替换为<br/>
        if (match.startsWith("<pre") || match.includes("<div className=")) {
            return match;
        }
        return match.replace(/\n/g, '<br/>');
    });
    // console.log(htmlString);
    // 返回处理后的HTML节点和复制代码的数据
    return {
        nodes: "<div class='rich-text'>" + htmlString + "</div>",
        copyCode: copyCode,
    };
}

// 定义一个函数，用于获取复制代码的数据
function getCopyCode(htmlString) {
    // 通过分割HTML字符串来获取所有的代码索引
    const ids = htmlString.split(COPY_CODE_HTML_PREV);
    const copyCode = {};
    // 如果存在多个索引
    if (ids && ids.length > 1) {
        for (let i = 1; i < ids.length; i++) {
            // 获取每个索引的结束位置
            const idEndIndex = ids[i].indexOf("\"");
            if (idEndIndex <= 0) {
                continue;
            }
            // 获取每个复制按钮的ID
            const copyId = ids[i].substring(0, idEndIndex);
            // 获取对应的代码
            const code = COPY_CODE[copyId];
            if (code) {
                // 将代码存储在copyCode对象中
                copyCode[copyId] = code;
                // 删除COPY_CODE中的对应条目，避免内存泄漏
                delete COPY_CODE[copyId];
            }
        }
    }
    // 返回复制代码的数据
    return copyCode;
}

// 定义一个函数，用于处理微信小程序中的特殊情况
function mpWeiXinSpecialHandle(htmlString) {
    // 定义一个包含所有HTML标签的数组
    const tags = "small,dd,tt,dl,hr,del,div,dt,ul,details,abbr,pre,blockquote,dfn,input,figcaption,sub,strong,img,code,samp,h1,h2,h3,h4,h5,h6,g-emoji,sup,ol,table,summary,a,figure,b,kbd,td,p,th,li,mark,span".split(",");
    // 遍历所有标签
    for (let i in tags) {
        const tag = tags[i];
        // 如果HTML字符串中包含特定标签的类
        if (htmlString.indexOf(`<${tag} class="`) !== -1) {
            // 创建一个正则表达式，用于匹配特定标签的类
            const regex = new RegExp(`<${tag} class="`, "g");
            // 替换类名，为其添加微信小程序特有的前缀
            htmlString = htmlString.replace(regex, `<${tag} class="mp-${tag} `);
        } else if (htmlString.indexOf(`<${tag} `) !== -1) {
            // 如果HTML字符串中包含特定标签
            const regex = new RegExp(`<${tag} `, "g");
            // 替换标签，为其添加类名和微信小程序特有的前缀
            htmlString = htmlString.replace(regex, `<${tag} class="mp-${tag}" `);
        }
        // 如果HTML字符串中包含特定标签
        if (htmlString.indexOf(`<${tag}>`) !== -1) {
            const regex = new RegExp(`<${tag}>`, "g");
            // 替换标签，为其添加类名和微信小程序特有的前缀
            htmlString = htmlString.replace(regex, `<${tag} class="mp-${tag}">`);
        }
    }
    // 返回处理后的HTML字符串
    return htmlString;
}

// 导出render函数作为默认导出
export default {
    render,
}

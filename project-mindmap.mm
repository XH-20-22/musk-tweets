<map version="freeplane 1.11.5">
<!--To view this file, download free mind mapping software Freeplane from https://www.freeplane.org -->
<node TEXT="Elon Musk 推文抓取系统" FOLDED="false" ID="ID_1" CREATED="1712241600000" MODIFIED="1712241600000" STYLE="oval">
<font SIZE="18"/>
<hook NAME="MapStyle">
    <properties edgeColorConfiguration="#808080ff,#ff0000ff,#0000ffff,#00ff00ff,#ff00ffff,#00ffffff,#7c0000ff,#00007cff,#007c00ff,#7c007cff,#007c7cff,#7c7c00ff" fit_to_viewport="false" associatedTemplateLocation="template:/standard-1.6.mm"/>
<map_styles>
<stylenode LOCALIZED_TEXT="styles.root_node" STYLE="oval" UNIFORM_SHAPE="true" VGAP_QUANTITY="24 pt">
<font SIZE="24"/>
<stylenode LOCALIZED_TEXT="styles.predefined" POSITION="bottom_or_right" STYLE="bubble">
<stylenode LOCALIZED_TEXT="default" ID="ID_default" COLOR="#000000" STYLE="fork">
<arrowlink SHAPE="CUBIC_CURVE" COLOR="#000000" WIDTH="2" TRANSPARENCY="200" DASH="" FONT_SIZE="9" FONT_FAMILY="SansSerif" DESTINATION="ID_default" STARTARROW="NONE" ENDARROW="DEFAULT"/>
<font NAME="SansSerif" SIZE="10" BOLD="false" ITALIC="false"/>
<richcontent TYPE="DETAILS"/>
<richcontent TYPE="NOTE"/>
</stylenode>
</stylenode>
</stylenode>
</map_styles>
</hook>
<node TEXT="📁 项目目录" POSITION="bottom_or_right" ID="ID_2" CREATED="1712241600000" MODIFIED="1712241600000">
<node TEXT="/Users/lzc/musk-tweets/" ID="ID_3">
<node TEXT="public/" ID="ID_4">
<node TEXT="index.html - 展示页面" ID="ID_5"/>
</node>
<node TEXT="scripts/" ID="ID_6">
<node TEXT="fetch-simple.js" ID="ID_7"/>
<node TEXT="fetch-final.js" ID="ID_8"/>
<node TEXT="fetch-direct.js" ID="ID_9"/>
<node TEXT="fetch-tweets-realtime.js" ID="ID_10"/>
</node>
<node TEXT="data/" ID="ID_11">
<node TEXT="raw_output.txt" ID="ID_12"/>
</node>
<node TEXT="extract_tweets_v2.js" ID="ID_13"/>
</node>
</node>
<node TEXT="🎯 核心需求" POSITION="bottom_or_right" ID="ID_14">
<node TEXT="✅ 抓取 Elon Musk 推文" ID="ID_15"/>
<node TEXT="✅ 保留原始格式（emoji、字体）" ID="ID_16"/>
<node TEXT="✅ 识别媒体类型（📷🎥）" ID="ID_17"/>
<node TEXT="⏳ 整合数据到 index.html" ID="ID_18"/>
<node TEXT="🔄 自动翻译功能（可选）" ID="ID_19"/>
</node>
<node TEXT="💻 技术栈" POSITION="bottom_or_right" ID="ID_20">
<node TEXT="Playwright MCP Server" ID="ID_21">
<node TEXT="端口: 9090" ID="ID_22"/>
<node TEXT="Profile: ~/.playwright-mcp/chrome-profile" ID="ID_23"/>
</node>
<node TEXT="Chrome for Testing.app" ID="ID_24"/>
<node TEXT="Node.js + JavaScript" ID="ID_25"/>
<node TEXT="MCP 调用: mcporter" ID="ID_26"/>
</node>
<node TEXT="✅ 已完成功能" POSITION="bottom_or_right" ID="ID_27">
<node TEXT="1. 浏览器配置" ID="ID_28">
<node TEXT="修复 Playwright 路径" ID="ID_29"/>
<node TEXT="启动 MCP Server" ID="ID_30"/>
</node>
<node TEXT="2. 推文抓取" ID="ID_31">
<node TEXT="访问 x.com/elonmusk" ID="ID_32"/>
<node TEXT="提取 11+ 条推文" ID="ID_33"/>
<node TEXT="保留 emoji 和格式" ID="ID_34"/>
</node>
<node TEXT="3. 数据提取" ID="ID_35">
<node TEXT="推文文本" ID="ID_36"/>
<node TEXT="发布时间" ID="ID_37"/>
<node TEXT="推文链接" ID="ID_38"/>
<node TEXT="媒体类型标识" ID="ID_39"/>
</node>
</node>
<node TEXT="🔧 技术难点" POSITION="bottom_or_right" ID="ID_40">
<node TEXT="JSON 转义字符问题" ID="ID_41">
<node TEXT="症状: \x 导致解析错误" ID="ID_42"/>
<node TEXT="原因: Shell 多重转义" ID="ID_43"/>
<node TEXT="解决方案" ID="ID_44">
<node TEXT="浏览器控制台直接运行" ID="ID_45"/>
<node TEXT="正则预处理清理" ID="ID_46"/>
<node TEXT="简化脚本结构" ID="ID_47"/>
</node>
</node>
<node TEXT="页面动态加载" ID="ID_48">
<node TEXT="特点: React 动态渲染" ID="ID_49"/>
<node TEXT="处理: 等待 article 元素" ID="ID_50"/>
</node>
</node>
<node TEXT="🚀 工作流程" POSITION="bottom_or_right" ID="ID_51">
<node TEXT="1️⃣ 启动 Playwright MCP Server" ID="ID_52"/>
<node TEXT="2️⃣ 打开浏览器访问 x.com" ID="ID_53"/>
<node TEXT="3️⃣ 等待推文加载" ID="ID_54"/>
<node TEXT="4️⃣ 运行提取脚本" ID="ID_55"/>
<node TEXT="5️⃣ 清理和格式化数据" ID="ID_56"/>
<node TEXT="6️⃣ 更新到 index.html" ID="ID_57"/>
<node TEXT="7️⃣ (可选) 调用翻译 API" ID="ID_58"/>
</node>
<node TEXT="📝 下一步计划" POSITION="bottom_or_right" ID="ID_59">
<node TEXT="🔴 解决 JSON 转义问题" ID="ID_60"/>
<node TEXT="🔴 整合真实数据到页面" ID="ID_61"/>
<node TEXT="🟡 优化展示样式" ID="ID_62"/>
<node TEXT="🟢 添加自动更新机制" ID="ID_63"/>
<node TEXT="🟢 实现翻译功能" ID="ID_64"/>
</node>
<node TEXT="🛠️ 使用的 Skills" POSITION="bottom_or_right" ID="ID_65">
<node TEXT="browser-operation" ID="ID_66">
<node TEXT="浏览器自动化操作" ID="ID_67"/>
</node>
<node TEXT="mcporter" ID="ID_68">
<node TEXT="调用 Playwright MCP" ID="ID_69"/>
</node>
</node>
<node TEXT="📊 项目状态" POSITION="bottom_or_right" ID="ID_70">
<node TEXT="🟡 进行中" ID="ID_71" COLOR="#ff9900">
<node TEXT="核心抓取 ✅" ID="ID_72"/>
<node TEXT="数据整合 ⏳" ID="ID_73"/>
<node TEXT="页面展示 ⏳" ID="ID_74"/>
</node>
</node>
</node>
</map>
<?php

	/*
		
		custom-html.php
		jlab-script-plus 2.0 beta2
		
		index.html に設定するカスタムHTML用のファイルです。ろだ毎のメニュー作成や追記事項記入にお使いください。
		HTML・CSS・Javascriptを記入することができます。
		
	*/
	
//☆meta Descriptionタグ
//　SEO対策のページ説明タグを挿入します。HTMLタグは使用できません。
$metaDescription = "";

//☆メニュー用HTML
//　アップロードパネル下に横メニューが表示されます。
//　コメントアウトを除去・サンプルを編集してください。
$CustomHTML1 = <<<CustomHTML1
<ul id="CustomList">
	<li>リスト1</li>
	<li><a href="#">リスト2</a></li>
	<li><a href="https://www.github.com/kouki-kuriyama/jlab-script-plus2" target="_blank">GitHub</a></li>
	<li>※ここのリストは custom-html.php でカスタマイズできます</li>
</ul>
<!--
<ul id="CustomList">
	<li><a href="#">みほん1</a></li>
	<li><a href="#" target="_blank">みほん2</a></li>
	<li>みほん3</li>
</ul>
-->
CustomHTML1;

//☆カスタムHTML 2
//　アップローダーの下部（バージョン情報の上）に表示されます。
$CustomHTML2 = <<<CustomHTML2

このアップローダーはjlab-script-plusの最新版テストページです。<br>
※ここのテキストは custom-html.php でカスタマイズできます。

CustomHTML2;

?>

	
	
	/*
		data-control.js - Ver2.0a
		 jsp2 (jlab-script-plus Ver2.0)
	*/
	
	//追加のグローバル変数
	var SelectedImageDatas = { ImageNames:[], LastSelected:0 };
	
	//表示切り替え用
	function ElementSwitch(ElementID, DisplayCommand, InputText){
		document.getElementById(ElementID).style.display = DisplayCommand;
		document.getElementById(ElementID).innerHTML = InputText;
		return;
	}
	
	//URLBox切り替え用
	function ToggleURLBox(){
		if( !UploaderStatus.URLBox ){
			document.getElementById("URLBox").style.marginTop = "-180px";
			UploaderStatus.URLBox = true;
		}else{
			document.getElementById("URLBox").style.marginTop = "0px";
			UploaderStatus.URLBox = false;
		}
		return;
	}
	
	//Stream画像の選択
	function ClickSelectImage(ImageDataSet, e){
		
		if( ImageDataSet == "Clear" ){
			for( var i=0; i < SelectedImageDatas.ImageNames.length; i++ ){
				if( document.getElementById("ImageList-" + SelectedImageDatas.ImageNames[i] + "") ){
					document.getElementById("ImageList-" + SelectedImageDatas.ImageNames[i] + "").style.background = "transparent";
					document.getElementById("ImageList-" + SelectedImageDatas.ImageNames[i] + "").setAttribute("data-selected", "0");
				}
			}
			SelectedImageDatas = { ImageNames:[], LastSelected:0 };
			return;
		}
		
		var ClickImageListCount = ImageDataSet.dataset.icount;
		if( e.shiftKey ){
			if( SelectedImageDatas.LastSelected < ClickImageListCount ){
				var SelectStartCount = Number(SelectedImageDatas.LastSelected)+1;
				var SelectUp = true;
			}else if( SelectedImageDatas.LastSelected > ClickImageListCount ){
				var SelectStartCount = Number(SelectedImageDatas.LastSelected)-1;
				var SelectUp = false;
			}
		}else{
			var SelectStartCount = ClickImageListCount;
			var SelectUp = true;
		}
		
		for( var i=SelectStartCount; ;){
			var SelectedFlag = document.getElementById("ImageList-" + DisplayStream.ImageNames[i] + "").getAttribute("data-selected");
			if( SelectedFlag === "0" ){
				document.getElementById("ImageList-" + DisplayStream.ImageNames[i] + "").style.background = "#bcddeb";
				document.getElementById("ImageList-" + DisplayStream.ImageNames[i] + "").setAttribute("data-selected", "1");
				NewerAddURLBox([DisplayStream.ImageNames[i]], "Add");
			}else{
				document.getElementById("ImageList-" + DisplayStream.ImageNames[i] + "").style.background = "transparent";
				document.getElementById("ImageList-" + DisplayStream.ImageNames[i] + "").setAttribute("data-selected", "0");
				NewerAddURLBox([DisplayStream.ImageNames[i]], "Del");
			}

			if( SelectUp ){
				if( i < ClickImageListCount ){
					i++;
					continue;
				}else{
					SelectedImageDatas.LastSelected = Number(i);
					break;
				}
			}else if( !SelectUp ){
				if( ClickImageListCount < i ){
					i--;
					continue;
				}else{
					SelectedImageDatas.LastSelected = Number(i);
					break;
				}
			}
		}
		console.log(SelectedImageDatas);
		return;
	}
	
	//画像URLのコピー
	function CopyImageURL(ImageDataSet, DataTag){
	
		//Microsoft Edge
		if( window.clipboardData ){
			var GetCopiedBox = ImageDataSet.getElementsByTagName(DataTag)[0].value.replace(/\n/g,"\r\n");
			window.clipboardData.setData("Text",GetCopiedBox);
		}
		
		//その他のブラウザ(Chrome<PC, Android>/Firefox/Safari<macOS>対応)
		else{
			ImageDataSet.getElementsByTagName(DataTag)[0].select();
			try{
				document.execCommand("copy");
			}catch(err){
				alert("URLのコピーに失敗しました\n手動でURLをコピーしてください");
				return;
			}
			ImageDataSet.getElementsByTagName(DataTag)[0].select();
		}
		
		return;
		
	}
	
	//URLBoxに追加(新しいバージョン)
	function NewerAddURLBox( ArrayImageNames, Mode ){
		
		if( !UploaderStatus.URLBox ) ToggleURLBox();
		
		var URLBoxValue = document.getElementById("TextURLBox").value;
		if( Mode == "Add" ){
			var AddingURLContents = "";
			for( i=0; i < ArrayImageNames.length; i++ ){
				AddingURLContents += MasterSettings.ImageURL + ArrayImageNames[i] + "\n";
				SelectedImageDatas.ImageNames.unshift(ArrayImageNames[i]);
			}
			
			if( URLBoxValue ){
				document.getElementById("TextURLBox").value =  AddingURLContents + URLBoxValue;
			}else{
				document.getElementById("TextURLBox").value = AddingURLContents;
			}
		}else if( Mode == "Del" ){
			for( i=0; i < ArrayImageNames.length; i++ ){
				URLBoxValue = URLBoxValue.split(MasterSettings.ImageURL + ArrayImageNames[i] + "\n").join("");
				SelectedImageDatas.ImageNames.splice(SelectedImageDatas.ImageNames.indexOf(ArrayImageNames[i]), 1);
			}
			document.getElementById("TextURLBox").value = URLBoxValue;
		}
		
		return;
		
	}
	
	//URLBoxに挿入
	function AddURLBox(ImageNameArray){

		var AddingURLContents = ""
		for( i=0; i < ImageNameArray.length; i++ ){
			AddingURLContents += MasterSettings.ImageURL + ImageNameArray[i] + "\n";
			InputableImageName.push(ImageNameArray[i]);
		}
		
		if( document.getElementById("TextURLBox").value ){
			document.getElementById("TextURLBox").value = document.getElementById("TextURLBox").value + AddingURLContents;
		}else{
			document.getElementById("TextURLBox").value = AddingURLContents;
		}
		
		return;
	}
	
	
	//StreamのAjax取得
	function LoadStream(PageCount, ForceReload){
	
		//ライトモードが有効の場合
		if( UserSettings.LightMode == "Enable" && !ForceReload ){
			var LightModeMessage = "\
				<strong>ライトモードが有効になっています</strong><br>\n\
				<a href=\"javascript:void(0)\" onclick=\"LoadStream(1,true)\">Streamを読み込む</a>\n\
				</div>\n\
				";
			ElementSwitch("ImageListMessage", "block", LightModeMessage);
			return;
		}
		
		if( ForceReload ){
			PageScroll("ListTabs");
		}
		
		//Streamのリストを非表示・初期化
		ElementSwitch("ImageList", "none", "");
		ElementSwitch("ImageListTable", "none", "");
		
		//読み込み中表示
		ElementSwitch("ImageListMessage", "block", "Stream読み込み中");
		
		//Ajax開始
		xmlRequest.onreadystatechange = function() {
			if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 200 )){
				GenerateStreamHTML( xmlRequest.responseText );
			}else if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 404 )){
				ElementSwitch("ImageListMessage", "block", "<strong>アップロードされた画像はありません</strong>");
			}
		}
			
		xmlRequest.open("GET","./application/imagelist.php?p=" + PageCount + "&d=" + UserSettings.DisplayCount + "", true);
		xmlRequest.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=UTF-8");
		xmlRequest.send(null);
		
		return;
	
	}
	
	//StreamのHTML生成
	function GenerateStreamHTML(ImageListJSON){
	
		var ImageListRes = JSON.parse( ImageListJSON );
		var OutputHTML = "";
		var OutputListHTML = "";
		
		if( ImageListRes[1] == null ){
			ElementSwitch("ImageListMessage", "block", "<strong>アップロードされた画像はありません</strong>");
			return;
		}
		
		DisplayStream = { ImageNames:[], Count:ImageListRes[0]["Count"] };
		
		for( var ci=1; ci <= ImageListRes[0]["Count"]; ci++ ){
			
			DisplayStream.ImageNames[ci] = ImageListRes[ci]["Name"];
			OutputHTML += "<li id=\"ImageList-" + ImageListRes[ci]["Name"] + "\" data-selected=\"0\" data-icount=\"" + ci + "\" data-iname=\"" + ImageListRes[ci]["Name"] + "\">\n";
			OutputHTML += "<img-title>投稿日時：" + ImageListRes[ci]["Time"] + "<img-info> " + ImageListRes[ci]["Meta"] + "</img-info></img-title>\n";
			OutputHTML += "<a href=\"" + MasterSettings.ImageURL + ImageListRes[ci]["Name"] + "\" target=\"_blank\"><img src=\"./" + MasterSettings.ThumbDirectory + "/" + ImageListRes[ci]["Name"] + "\"></a>\n";
			OutputHTML += "<input type=\"text\" class=\"DefaultTB\" value=\"" + MasterSettings.ImageURL + ImageListRes[ci]["Name"] + "\" onclick=\"this.select(0,this.value.length)\" readonly>\n";
			OutputHTML += "<input type=\"button\" class=\"PositiveBT\" value=\"選択切替\" onclick=\"ClickSelectImage(this.parentNode, event)\">\n";
			OutputHTML += "<input type=\"button\" class=\"PositiveBT\" value=\"画像URLをコピー\" onclick=\"CopyImageURL(this.parentNode, 'input')\">\n";
			OutputHTML += "<input type=\"button\" class=\"NegativeBT\" value=\"削除\" onclick=\"DeleteImage('" + ImageListRes[ci]["Name"] + "')\">\n";
			OutputHTML += "<br style=\"clear:left\">\n";
			OutputHTML += "</li>\n\n";
			
		}
		
		OutputHTML += "<div style=\"margin:28px 42px; font-size:12px; color:#444\">[選択切替] で画像が選択され、URLBoxに画像URLが追加されます。<br>選択したい最初の画像を選択後、シフトキーを押しながら選択したい画像を選択すると範囲選択ができます。</div>\n";
		
		if( ImageListRes[0]["Prev"] != false ){
			for( var ltp=0; ltp <= ImageListRes[0]["Prev"]; ltp=ltp+100 ){
				if( ltp == 0 ){
					OutputListHTML += "<li onclick=\"LoadStream(1,true)\">1</li>\n";
					continue;
				}
				OutputListHTML += "<li onclick=\"LoadStream(" + ltp + ",true)\">" + ltp + "</li>\n";
			}
		}
		
		for( var lti=ImageListRes[0]["Min"]; lti <= ImageListRes[0]["Max"]; lti++ ){
			if( lti == ImageListRes[0]["Page"] ){
				OutputListHTML += "<li class=\"SelectedTable\">" + lti + "</li>\n";
				continue;
			}
			OutputListHTML += "<li onclick=\"LoadStream(" + lti + ",true)\">" + lti + "</li>\n";
		}
		if( ImageListRes[0]["Next"] != false ){
			for( var ltn=parseInt(ImageListRes[0]["Next"]); ltn < ImageListRes[0]["PageCount"]; ltn=ltn+100 ){
				OutputListHTML += "<li onclick=\"LoadStream(" + ltn + ",true)\">" + ltn + "</li>\n";
			}
		}
		
		ElementSwitch("ImageListMessage", "none", "");
		ElementSwitch("ImageList", "block", OutputHTML);
		ElementSwitch("HistoryImageList", "none", "");
		ElementSwitch("ImageListTable", "flex", OutputListHTML);
		
		return;
		
	}
	
	//履歴のHTML生成
	function LoadHistory(PageCount){
	
		var ImageListRes = JSON.parse(localStorage.getItem("jsp-history"));
		if( ImageListRes.UploadedCount == 0 ){
			ElementSwitch("HistoryImageListMessage", "block", "<strong>履歴はありません</strong>");
			if( UserSettings.History == "Disable" ){
				document.getElementById("HistoryImageListMessage").insertAdjacentHTML("beforeend", "<br>[履歴の保存]が無効に設定されています");
			}
			return;
		}
		var OutputHTML = "";
		var OutputListHTML = "";
		var DisplayElementStart = (PageCount*UserSettings.DisplayCount)-UserSettings.DisplayCount;
		var DisplayElementEnd = PageCount*UserSettings.DisplayCount;
		
		DisplayStream = { ImageNames:[], Count:DisplayElementEnd };
		
		for( var ci=DisplayElementStart; ci < DisplayElementEnd; ci++ ){
		
			if( !ImageListRes["UploadedImages"][ci] ) break;
			
			DisplayStream.ImageNames[ci] = ImageListRes["UploadedImages"][ci];
			OutputHTML += "<li id=\"ImageList-" + ImageListRes["UploadedImages"][ci] + "\" data-selected=\"0\" data-icount=\"" + ci + "\" data-iname=\"" + ImageListRes["UploadedImages"][ci] + "\">\n";
			OutputHTML += "<a href=\"" + MasterSettings.ImageURL + ImageListRes["UploadedImages"][ci] + "\" target=\"_blank\"><img src=\"./" + MasterSettings.ThumbDirectory + "/" + ImageListRes["UploadedImages"][ci] + "\"></a>\n";
			OutputHTML += "<input type=\"text\" class=\"DefaultTB\" value=\"" + MasterSettings.ImageURL + ImageListRes["UploadedImages"][ci] + "\" onclick=\"this.select(0,this.value.length)\" readonly>\n";
			OutputHTML += "<input type=\"button\" class=\"PositiveBT\" value=\"選択切替\"  onclick=\"ClickSelectImage(this.parentNode, event)\">\n";
			OutputHTML += "<input type=\"button\" class=\"PositiveBT\" value=\"画像URLをコピー\" onclick=\"CopyImageURL(this.parentNode, 'input')\">\n";
			OutputHTML += "<input type=\"button\" class=\"NegativeBT\" value=\"削除\" onclick=\"DeleteImage('" + ImageListRes["UploadedImages"][ci] + "')\">\n";
			OutputHTML += "<input type=\"button\" class=\"NegativeBT\" value=\"履歴から削除\" onclick=\"DeleteHistory(['" + ImageListRes["UploadedImages"][ci] + "'], true)\">\n";
			OutputHTML += "<br style=\"clear:left\">\n";
			OutputHTML += "</li>\n\n";
			
		}
		
		OutputHTML += "<div style=\"margin:28px 42px; font-size:12px; color:#444\">設定タブの [アップロード履歴を整理] を行うと、期限切れで自動削除された画像を履歴から削除することができます。</div>\n";
		
		//ページ数の計算
		var HistoryDisplayPageCount = Math.ceil(ImageListRes["UploadedCount"]/UserSettings.DisplayCount);
		for( var lti=1; lti <= HistoryDisplayPageCount; lti++ ){
			if( lti == PageCount ){
				OutputListHTML += "<li class=\"SelectedTable\">" + lti + "</li>\n";
				continue;
			}
			OutputListHTML += "<li onclick=\"LoadHistory(" + lti + ",)\">" + lti + "</li>\n";
		}
		
		ElementSwitch("HistoryImageListMessage", "none", "");
		if( UserSettings.History == "Disable" ){
			ElementSwitch("HistoryImageListMessage", "block", "<strong>[履歴の保存]が無効に設定されています</strong><br>設定有効時に保存されていた履歴を表示中です");
		}
		
		ElementSwitch("ImageList", "none", "");
		ElementSwitch("HistoryImageList", "block", OutputHTML);
		ElementSwitch("HistoryImageListTable", "flex", OutputListHTML);
		PageScroll("ListTabs");
		
		return;
		
	}
	
	//履歴操作
	function DeleteHistory( ImageNames,DisplayMessage ){
		
		if( DisplayMessage ){
			if( !window.confirm(ImageNames + " を履歴から削除してもよろしいですか？")){
				return;
			}
		}
		
		//履歴から削除する枚数を確認
		var DeleteCount = ImageNames.length;
		if( DeleteCount == 0 ) return;
		var OldHistoryCount = UploadHistory.UploadedCount;
		
		//履歴から対象画像を削除
		for( var j=0; j < DeleteCount; j++ ){
			
			//履歴に対象画像(キー)があるかを検索
			var HitKey = UploadHistory.UploadedImages.indexOf(ImageNames[j]);
			
			//ヒットしたらそのキーを削除
			if( HitKey != -1 ){
				UploadHistory.UploadedImages.splice(HitKey,1);
				UploadHistory.UploadedCount--;
			}
		}
		
		
		//LocalStorageに保存
		if( OldHistoryCount > UploadHistory.UploadedCount ){
			localStorage.setItem("jsp-history",JSON.stringify(UploadHistory));
		
			//手動による履歴削除の場合はメッセージを表示
			if( DisplayMessage ) alert("削除しました");
		}
	
		return;
	}
	
	//削除
	function DeleteImage(DeleteMode){
		
		if( DeleteMode != 1 ){
			var PostDeleteImages = [ DeleteMode ];
			if( !window.confirm( "[ ? ] " + DeleteMode + "を削除しますか？\n削除キーを変更する場合はページ上部の削除キーを変更してください" )){
				return;
			}
		}else{
			var PostDeleteImages = SelectedImageDatas.ImageNames;
			if( !window.confirm( "[ ? ] URLBoxの画像をすべて削除しますか？\n削除キーを変更する場合はページ上部の削除キーを変更してください" )){
				return;
			}
		}
		
		//削除キー取得
		DeleteKey = document.getElementById("DeleteKey").value;
		
		xmlRequest.onreadystatechange = function() {
			if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 200 )){
				var DeleteResponse = JSON.parse( xmlRequest.responseText );
				var AlertMessage = "";
				var SuccessDeleteImages = [];
				for( DeleteResponseKey in DeleteResponse ){
					if( DeleteResponse[DeleteResponseKey] == 0 ){
						SuccessDeleteImages.push(DeleteResponseKey);
						AlertMessage += "[ i ] " + DeleteResponseKey + "は削除されました\n";
					}else if( DeleteResponse[DeleteResponseKey] == 1 ){
						AlertMessage += "[ ! ] " + DeleteResponseKey + "の削除キーが間違ってるか設定されていません\n";
					}else if( DeleteResponse[DeleteResponseKey] == 2 ){
						AlertMessage += "[ ! ] " + DeleteResponseKey + "は見つかりませんでした\n";
					}
				}
				alert(AlertMessage);
				DeleteHistory(SuccessDeleteImages, false);
				if( DeleteMode == 1 ){
					document.getElementById("TextURLBox").value = "";
					SelectedImageDatas = { ImageNames:[], LastSelected:0 };
					if( UploaderStatus.URLBox ) ToggleURLBox();
				}
				LoadStream(1, false);
			}else if(( xmlRequest.readyState == 4 )&&( xmlRequest.status != 200 )){
				alert("[ ! ] 削除時に不明なエラーが発生しました");
			}
		}
		
		xmlRequest.open("POST","./application/deletion.php", true);
		xmlRequest.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=UTF-8");
		xmlRequest.send("DeleteImages=" + encodeURIComponent(JSON.stringify(PostDeleteImages)) + "&DeleteKey=" + DeleteKey + "");
		
		return;
	}
	
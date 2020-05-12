	
	
	/*
		uploader.js
		jlab-script-plus 2.0
	*/
	
	
	//--- ---//
	
	//アップローダーDOMをコントロールする
	class DOMControler {
		
		//DOMの取得
		constructor(){
			this.MessageText = "";
			this.UploaderMessage = document.getElementById("UploaderMessageArea");
			this.PreviewArea = document.getElementById("PreviewArea");
			this.PreviewAreaMessage = document.getElementById("PreviewAreaMessage");
			this.UploadedURLBox = document.getElementById("UploadedURLBox");
			this.UploaderFinishButton = document.getElementById("UploaderFinishButton");
			this.UploaderFinishPanel = document.getElementById("UploaderFinishPanel");
			this.UploaderStartPanel = document.getElementById("UploaderStartPanel");
			this.UploaderSelectPanel = document.getElementById("UploaderSelectPanel");
		}
		
		//メッセージテキストを変更
		UpdateMessageText(){
			this.UploaderMessage.innerHTML = this.MessageText;
		}
		
		//プレビューを有効化
		EnablePreview(){
			this.PreviewArea.style.display = "block";
			this.PreviewAreaMessage.style.display = "none";
		}
		
		//プレビューを無効化
		DisablePreview(){
			this.PreviewArea.style.display = "none";
			this.PreviewArea.innerHTML = "";
			this.UploaderFinishPanel.style.display = "none";
			this.UploaderStartPanel.style.display = "none";
			this.UploaderSelectPanel.style.display = "block";
			this.PreviewAreaMessage.style.display = "inline";
		}
		
		//アップロードボタンを有効化
		EnableUploadButton(){
			this.UploaderStartPanel.style.display = "block";
		}
		
		//アップロード中
		Uploading(){
			this.UploaderSelectPanel.style.display = "none";
			this.UploaderStartPanel.style.display = "none";
			this.UploadedURLBox.style.display = "none";
		}
		
		//画像URLフラッシュ開始
		FlushingURL(){
			this.UploaderFinishPanel.style.display = "block";
			this.UploaderFinishButton.style.display = "none";
			this.UploadedURLBox.style.display = "block";
		}
		
		//アップロード完了
		FinishUpload(){
			this.UploaderFinishButton.style.display = "block";
		}
	
	}
	
	//ファイルをドラッグ中
	function onFileOver(e){
		e.preventDefault();
		if( UploaderStatus.Processing ){
			return;
		}
	}
	
	//ファイルをドロップ
	function onFileDrop(e){
	
		//ブラウザの初期動作を抑制
		e.stopPropagation();
		e.preventDefault();
		
		//アップロード処理中は無効化
		if( UploaderStatus.Processing ){
			return;
		}
		
		//取り込み画像を初期化
		RawBinaryImages.Files = [];
		RawBinaryImages.Counts = e.dataTransfer.files.length;
		
		//Windows向け(画像の並べ替え)
		for( let di=0; di < e.dataTransfer.files.length; di++ ){
			RawBinaryImages.Files[di] = e.dataTransfer.files[di];
		}
		RawBinaryImages.Files.sort(function(a, b){
			if( a["name"] > b["name"] ) return 1;
			if( a["name"] < b["name"] ) return -1;
			return 0;
		});
		
		UploaderStatus.DragDrop = true;
		FileAnalyzer();
		
		return;
	}
	
	
	//ダイアログから画像を選択
	function OpenFileDialog(){
		document.getElementById("SelectFiles").click();
		return;
	}
	
	//ダイアログで選択された画像の処理
	function onFileDialog(){
	
		//キャンセルされた場合は終了
		if( !document.getElementById("SelectFiles").files ){
			return;
		}
		
		//取り込み画像を初期化
		RawBinaryImages.Files = [];
		RawBinaryImages.Counts = document.getElementById("SelectFiles").files.length;
		for( let di=0; di < document.getElementById("SelectFiles").files.length; di++ ){
			RawBinaryImages.Files[di] = document.getElementById("SelectFiles").files[di];
		}
		
		UploaderStatus.DragDrop = false;
		FileAnalyzer();
		
		return;
	}
	
	//--- ---//


	//取り込まれた画像の処理
	function FileAnalyzer(){

		//DOMを初期化
		let DOMControl = new DOMControler();

		//同時アップロード枚数の確認
		if(( RawBinaryImages.Counts > MasterSettings.LimitCount )||( BinaryImages.Blob.length+RawBinaryImages.Counts > MasterSettings.LimitCount )){
			alert("同時アップロード枚数の制限を超えています");
			return;
		}

		//ファイル形式チェック
		for(let BinaryNum in RawBinaryImages.Files ){
			DOMControl.MessageText = "ファイル形式をチェック中…";
			DOMControl.UpdateMessageText();
			if( !RawBinaryImages.Files[BinaryNum].type.match(/image\/jpeg/) && !RawBinaryImages.Files[BinaryNum].type.match(/image\/png/) && !RawBinaryImages.Files[BinaryNum].type.match(/image\/gif/)){
				alert(RawBinaryImages.Files[BinaryNum].name + "はアップロードできる形式ではありません");
				RawBinaryImages.Files[BinaryNum] = false;
			}
		}
		
		for(let BinaryNum in RawBinaryImages.Files ){

			//前段階でキャンセルされているものは弾く
			if(RawBinaryImages.Files[BinaryNum] == false){
				continue;
			}
			
			//ファイルサイズチェック
			DOMControl.MessageText = "ファイルサイズをチェック中…";
			DOMControl.UpdateMessageText();
			if( RawBinaryImages.Files[BinaryNum].size > MasterSettings.LimitSizeByte ){
				alert(RawBinaryImages.Files[BinaryNum].name + " : "+ MasterSettings.LimitSize + "MB以上のファイルはアップロードできません");
				RawBinaryImages.Files[BinaryNum] = false;
			}else{
				
				//ファイル同一性チェック
				if( BinaryImages.FileSize.indexOf(RawBinaryImages.Files[BinaryNum].size) != -1 ){
					alert("同一のファイルはアップロードできません");
					RawBinaryImages.Files[BinaryNum] = false;
				}else{
					BinaryImages.FileSize.push(RawBinaryImages.Files[BinaryNum].size);
				}
			}
		}

		//キャンセルされた画像を省いて配列とカウント数をクリーンアップする
		RawBinaryImages.Files = RawBinaryImages.Files.filter(v => v);
		RawBinaryImages.Counts = RawBinaryImages.Files.length;

		//ファイルが存在しなくなったら処理を終了する
		if( RawBinaryImages.Counts < 1 ){
			if( UploaderStatus.Ready ){
				DOMControl.MessageText = "<strong>アップロード準備完了</strong><br><span style=\"font-size:12px\">プレビュー画像をクリックすると取り消しができます<br>画像を追加するには<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください</span>";
				DOMControl.EnableUploadButton();
				DOMControl.UpdateMessageText();
			}else{
				DOMControl.MessageText = "アップロードする画像を<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください";
				DOMControl.DisablePreview();
				DOMControl.UpdateMessageText();
			}
			return;
		}

		FileLoader(0);
		return;
	}

	//解析された画像を読み込む
	function FileLoader(LoadNum){

		//FileAPIとDOMの初期化
		let ImageReader = new FileReader();
		let DOMControl = new DOMControler();

		//Blob読み込み・プレビュー表示
		function getBlobData(){
			
			//プレビュー用のBlobURLを取得
			let getBlob = new Blob([new Uint8Array(ImageReader.result)], { type: RawBinaryImages.Files[LoadNum].type });
			let LoadedBlobURL = URL.createObjectURL(getBlob);

			//Blob形式で送信準備をする
			BinaryImages.Blob.push(getBlob);
			BinaryImages.MIMEType.push(RawBinaryImages.Files[LoadNum].type);
			
			//プレビューエリアをオープン
			DOMControl.EnablePreview();
			
			//プレビュー用HTMLを作成
			let PreviewImageTag = document.createElement("img");
			PreviewImageTag.src = LoadedBlobURL;
			PreviewImageTag.title = "この画像を取り消しますか？ 取り消す場合には画像をクリックします。";
			document.getElementById("PreviewArea").appendChild(PreviewImageTag);
			
			//1枚分の取り込みを完了
			LoadNum++;
			
			//画像の取り込みを継続する
			if( LoadNum < RawBinaryImages.Counts ){
				FileLoader(LoadNum);
			}else{
				if(( UserSettings.FastUpload == "Enable" )&&( MasterSettings.FastUpload )){
					UploaderStatus.Ready = true;
					StartUpload();
					return;
				}
				DOMControl.MessageText = "<strong>アップロード準備完了</strong><br><span style=\"font-size:12px\">プレビュー画像をクリックすると取り消しができます<br>画像を追加するには<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください</span>";
				DOMControl.EnableUploadButton();
				DOMControl.UpdateMessageText();
			}

			UploaderStatus.Ready = true;
			PageScroll("ContentsTop");
			document.title = "アップロード準備完了 - " + MasterSettings.Title;

		}
		
		//画像を取り込む
		DOMControl.MessageText = LoadNum+1 + "枚目を取り込み中…";
		DOMControl.UpdateMessageText();
		ImageReader.addEventListener("load", getBlobData, false);
		ImageReader.readAsArrayBuffer(RawBinaryImages.Files[LoadNum]);
		
		return;
	}
	
	
	//--- ---//
	
	
	//アップロードを開始する
	function StartUpload(){
		
		//DOMの初期化
		let DOMControl = new DOMControler();
		
		if( !UploaderStatus.Ready ){
			alert("アップロードする画像を選択してください");
			return;
		}
		
		DOMControl.MessageText = "待機中…";
		DOMControl.UpdateMessageText();
		UploaderStatus.Processing = true;
		
		DeleteKey = document.getElementById("DeleteKey").value;
		if(( UserSettings.FastUpload == "Enable" )&&( !DeleteKey )){
			alert("FastUploadを有効にするには削除キーを設定してください");
			DOMControl.MessageText = "<strong>FastUploadエラー</strong><br><span style=\"font-size:12px\">アップロードボタンを押してアップロードを開始してください</span>";
			DOMControl.EnableUploadButton();
			DOMControl.UpdateMessageText();
			UploaderStatus.Processing = false;
			return;
		}
		
		document.getElementById("PreviewAreaCover").style.display = "block";
		DOMControl.Uploading();
		
		let UploadedCount = 0;
		let UploadingCount = 0;
		
		//アップロード用関数
		function GoUpload(){
		
			//タイトルを変更
			document.title = (UploadedCount+1) + "/" + BinaryImages.Blob.length + " アップロード中 - " + MasterSettings.Title;
			DOMControl.MessageText = (UploadedCount+1) + "枚目をアップロード中…";
			DOMControl.UpdateMessageText();
			
			//アップロードデータを作成
			let UploadData = new FormData();
			UploadData.append("Image", BinaryImages.Blob[UploadingCount]);
			UploadData.append("MIMEType", BinaryImages.MIMEType[UploadingCount]);
			UploadData.append("DeleteKey", DeleteKey);
			
			//Ajax送信
			xmlRequest.open("POST","./application/uploader.php",true);
			xmlRequest.onreadystatechange = ResultFlush;
			xmlRequest.send(UploadData);
			
		}
		
		GoUpload();
		
		//アップロードが完了した順にAjaxでフラッシュしていく
		function ResultFlush(){
		
			if( xmlRequest.readyState == 4 ){
				
				//レスポンスを受け取る
				var UploadResponse = decodeURIComponent(xmlRequest.responseText);
				
				//アップロードエラー時の処理
				if( UploadResponse == "400" || UploadResponse == "403" || !UploadResponse ){
				
					DOMControl.MessageText = "エラーが発生した為、アップロードを停止しました";
					DOMControl.UpdateMessageText();
					document.title = "アップロード失敗 - " + MasterSettings.Title;
					xmlRequest.abort();
					
					switch( UploadResponse ){
						case "400":
							alert("正しくないパラメーターが送信されました");
						break;
						case "403":
							alert("この画像はアップロードできません");
						break;
						default:
							alert("不明なエラーが発生しました\nページを更新して再度お試しください\nアップローダーレスポンス：" + UploadResponse + "");
						break;
					}
					
					return;
				}
				
				//1枚目のアップロード終了時
				if( UploadedCount == 0 ){
					DOMControl.FlushingURL();
					document.getElementById("UploadedURLBox").value = MasterSettings.ImageURL + UploadResponse;
				}
				
				//2枚目以降のアップロード終了時
				else if( UploadedCount < BinaryImages.Blob.length ){
					let EndedUploadResponse = document.getElementById("UploadedURLBox").value;
					document.getElementById("UploadedURLBox").value = EndedUploadResponse + "\n" + MasterSettings.ImageURL + UploadResponse;
				}
				
				//アップロードカウントを増やす
				UploadingCount = UploadingCount+1;
				UploadedCount = UploadedCount+1;
				
				//アップロード済みの画像プレビューを削除する
				let RemovePreviewNode = document.getElementById("PreviewArea").firstElementChild;
				document.getElementById("PreviewArea").removeChild(RemovePreviewNode)

				UploaderStatus.UploadedPath[UploadedCount-1] = UploadResponse;
				
				//アップロードに続きがある場合の処理
				if( UploadedCount < BinaryImages.Blob.length ){
					GoUpload();
				}
				
				//アップロード終了時の表示
				else{
					
					DOMControl.MessageText = "アップロードが完了しました";
					DOMControl.FinishUpload();
					DOMControl.UpdateMessageText();
					document.title = "アップロード完了 - " + MasterSettings.Title;
					
					//削除キーが変わっている場合は新しい削除キーをオブジェクトに代入する
					if( UserSettings.DeleteKey != DeleteKey ){
						UserSettings.DeleteKey = DeleteKey;
						localStorage.setItem("jsp-settings",JSON.stringify(UserSettings));
					}
					
					//アップロード履歴に保存
					if( UserSettings.History == "Enable" ){
						for( i=0; i < UploaderStatus.UploadedPath.length; i++ ){
							UploadHistory.UploadedImages.unshift(UploaderStatus.UploadedPath[i]);
						}
						UploadHistory.UploadedCount = UploadHistory.UploadedCount + UploaderStatus.UploadedPath.length;
						SaveUserHistory();
					}
					
					xmlRequest.open("GET","./application/auto-deletion.php",true);
					xmlRequest.onreadystatechange = function(){
						if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 200 )){
							console.log("Uploader Cleared");
							return;
						}
					};
					xmlRequest.send(null);
				}
			}
			return;
		}
	}
	
	//キャンセル
	function ImageCancel(e){
		
  		let PreviewImageNodes = e.target.parentNode.querySelectorAll("img");
  		let PreviewNodeNum = Array.prototype.indexOf.call(PreviewImageNodes, e.target);
		
		if( PreviewNodeNum < 0 ){
			return;
		}
		
		if( window.confirm("画像を取り消しますか？")){
			
			//オブジェクトから削除
			BinaryImages.Blob[PreviewNodeNum] = false;
			BinaryImages.FileSize[PreviewNodeNum] = false;
			BinaryImages.MIMEType[PreviewNodeNum] = false;
			BinaryImages.Blob = BinaryImages.Blob.filter(v => v);
			BinaryImages.FileSize = BinaryImages.FileSize.filter(v => v);
			BinaryImages.MIMEType = BinaryImages.MIMEType.filter(v => v);
			
			//プレビュー表示を削除
			e.target.parentNode.removeChild(e.target);
			
			//最後の1枚も削除した場合は初期化する
			if( BinaryImages.Blob.length == 0 ){
				ClearUploader();
			}
			
		}
		
		return;
	}
	
	//表示と変数・オブジェクトを初期化する
	function ClearUploader(ForceConfirm){
		
		//確認ウィンドウを表示するか
		if( ForceConfirm ){
			if( !window.confirm("画像を取り消しますか？")){
				return;
			}
		}
		
		//DOM初期化
		let DOMControl = new DOMControler();
		
		//変数・オブジェクト初期化
		UploaderStatus.DragDrop = false;
		UploaderStatus.Processing = false;
		UploaderStatus.Ready = false;
		UploaderStatus.UploadedPath = [];
		RawBinaryImages = { Files:[], Counts:0 };
		BinaryImages = { Blob:[], FileSize:[], MIMEType:[] };
		UploadedCount = 0;
		
		//表示初期化
		document.title = MasterSettings.Title;
		
		//プレビューを非表示
		DOMControl.MessageText = "アップロードする画像を<strong>ドラッグアンドドロップ</strong>するか<strong>選択</strong>してください";
		DOMControl.DisablePreview();
		DOMControl.UpdateMessageText();
		
		return;
	
	}

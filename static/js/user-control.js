	
	
	/*
		user-control.js
		jlab-script-plus 2.0 beta2
	*/
	
	
	//オブジェクトの定義
	var UserSettings = new Object();
	var UploadHistory = new Object();
	
	//ユーザー設定の読み込み（index.htmlロード時）
	function LoadUserSetting(){
	
		//JSON形式のユーザー設定を読み込む
		var UserSettingsJSON = localStorage.getItem("jsp-settings");
		var UploadHistoryJSON = localStorage.getItem("jsp-history");
		
		//ユーザー設定が見つからない場合はデフォルトの設定を保存する
		if( !UserSettingsJSON ){
		
			//ユーザー設定
			UserSettings.DeleteKey = "";
			UserSettings.DisplayCount = "20";
			UserSettings.FastUpload = "Disable";
			UserSettings.History = "Enable";
			UserSettings.LightMode = "Disable";
			
			//アップロード履歴
			UploadHistory.UploadedImages = [];
			UploadHistory.UploadedCount = 0;
			
			//ローカルストレージにデフォルト設定を保存
			localStorage.setItem("jsp-settings",JSON.stringify(UserSettings));
			localStorage.setItem("jsp-history",JSON.stringify(UploadHistory));
		
		}else{
			UserSettings = JSON.parse(UserSettingsJSON);
		}
		
		if( !UploadHistoryJSON ){
			UploadHistory.UploadedImages = [];
			UploadHistory.UploadedCount = 0;
			localStorage.setItem("jsp-history",JSON.stringify(UploadHistory));
		}else{
			UploadHistory = JSON.parse(UploadHistoryJSON);
		}
		
		return;
		
	}
	
	//設定タブの表示
	function LoadSettingsTab(){
		var SettingElements = ["LightMode", "FastUpload", "History", "DisplayCount"];
		SettingElements.forEach(function(SettingElementsValue){
		var PullDownSelected = document.getElementById("Set" + SettingElementsValue).options;
			for( i=0; i < PullDownSelected.length; i++ ){
				if( PullDownSelected[i].value == UserSettings[SettingElementsValue] ){
					PullDownSelected[i].selected = true;
					break;
				}
			}
		});
		return;
	}
	
	//ページスクロール
	function PageScroll(ScrollerID){
		var BoxCoordinate = document.getElementById(ScrollerID).getBoundingClientRect();
		window.scroll(0,BoxCoordinate.top + window.pageYOffset);
		return;
	}
	
	//タブの切り替え
	function ToggleTab(OpeningTab){
		document.getElementById("Tab-" + UploaderStatus.OpenTab).style.display = "none";
		document.getElementById("Tab-" + OpeningTab).style.display = "block";
		UploaderStatus.OpenTab = OpeningTab;
		return;
	}
	
	//設定の保存
	function SaveUserSetting(SettingElements){
		
		var ChangeSettingElementData = document.getElementById(SettingElements.id).value;
		var ChangeSettingElementName = document.getElementById(SettingElements.id).dataset.sen;
		
		UserSettings[ChangeSettingElementName] = ChangeSettingElementData;
		localStorage.setItem("jsp-settings",JSON.stringify(UserSettings));
		
		return;
	}
	
	//アップロード履歴の保存
	function SaveUserHistory(){
		localStorage.setItem("jsp-history",JSON.stringify(UploadHistory));
		return;
	}
	
	//アップロード履歴の整理
	function CleanUpUserData(){
	
		var ImageListRes = JSON.parse(localStorage.getItem("jsp-history"));
		
		xmlRequest.open("POST","./application/imagelist.php?p=cleanup",true);
		xmlRequest.onreadystatechange = function(){
			if(( xmlRequest.readyState == 4 )&&( xmlRequest.status == 200 )){
				var NewImageListRes = JSON.parse(xmlRequest.responseText);
				var NewImageListResCount = NewImageListRes.length;
				
				UploadHistory.UploadedImages = NewImageListRes;
				UploadHistory.UploadedCount = NewImageListResCount;
				SaveUserHistory();
				
				alert("アップロード履歴の整理が完了しました");
				return;
			}
		};
		xmlRequest.setRequestHeader("content-type","application/x-www-form-urlencoded;charset=UTF-8");
		xmlRequest.send("history=" + JSON.stringify(ImageListRes.UploadedImages) + "");
	
		return;
	}
	
	//設定の初期化
	function InitializeUserData(Mode){
	
		if( window.confirm("本当によろしいですか？")){
			UploadHistory.UploadedImages = [];
			UploadHistory.UploadedCount = 0;
			SaveUserHistory();
			
			if( Mode == "All" ){
				UserSettings.DeleteKey = "";
				UserSettings.DisplayCount = "20";
				UserSettings.FastUpload = "Disable";
				UserSettings.History = "Enable";
				UserSettings.LightMode = "Disable";
				localStorage.setItem("jsp-settings",JSON.stringify(UserSettings));
			}
			alert("完了しました\nページを更新してください");
		}
		return;
	}
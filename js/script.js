//YOLP(Yahoo! Open Local Platform)のYahoo! JavaScriptマップAPIを使い、
//拠点住所（GPSコード）を地図上に表示するAPIを作成する。
//DOMはJavaScriptで描画する。
//画面上部にマップを表示、画面下部に住所一覧を表示する。
//住所一覧はデータベースに格納することなども考えられるがとりあえずべた書きでテスト
//
window.addEventListener('DOMContentLoaded', function () {

   //地図作成
   var ymap = new Y.Map("map");
   //onclickイベント登録
   var onclick = function () {
      console.log($('#output').html(this.getLatLng().toString()) + "ラベルがクリックされました");
      ymap.removeFeature(this);
   }

   //天気レイヤ作成
   var weather = new Y.WeatherMapLayer({
      "opacity": 0.6,
   });
   //天気レイヤを重ねる地図レイヤを作成
   var maplayer = new Y.NormalLayer();

   ymap.setConfigure('doubleClickZoom', true);
   ymap.setConfigure('scrollWheelZoom', true);
   ymap.setConfigure('dragging', true);


   //地図 + 天気レイヤを追加
   ymap.addLayerSet("weather", new Y.LayerSet("地図+天気", [maplayer, weather]));
   //スライダーバーを追加
   ymap.addControl(new Y.SliderZoomControlHorizontal());
   //センターマーク追加
   ymap.addControl(new Y.CenterMarkControl());
   //ホームアイコン追加
   //ymap.addControl(new Y.HomeControl());
   //レイヤを選択するコントロールを追加
   //ymap.addControl(new Y.LayerSetControl());
   //スケールバー表示
   ymap.addControl(new Y.ScaleControl());
   //	地図検索のユーザーインターフェースを表示
   ymap.addControl(new Y.SearchControl());


   //地図を描画
   ymap.drawMap(new Y.LatLng(35.65372620, 139.75613760), 9, "weather");
   //天気データを更新
   weather.UpdateWeather();
   //5分間毎に自動更新するように設定
   weather.setAutoUpdateInterval(5);
   //自動更新スタート
   weather.startAutoUpdate();

   //拠点データ作成
   const ADRESS_DATA = [
      ["東京駅", "東京", "〒100-0005", "東京都千代田区丸の内１丁目", "35.68124053757813", "139.76493611561207"],
      ["仙台駅", "仙台", "〒980-0021", "宮城県仙台市青葉区中央１丁目１０−１０", "38.26013579185813", "140.88024881566176"],
      ["札幌駅", "札幌", "〒060-0806", "北海道札幌市北区北６条西４丁目", "43.06866449804844", "141.34856661576404"],
   ];

   //ラベル描画
   makeLabels(ADRESS_DATA);

   //画面サイズ更新時のリサイズ処理
   $(window).bind("resize", function (e) {
      ymap.updateSize();
   });

   //クリック位置の緯度(x)経度(y)を取得
   $('#map').bind("click", function (e) {
      var pos = $(this).position();
      var x = e.pageX - pos.left;
      var y = e.pageY - pos.top;
      var ll = ymap.fromContainerPixelToLatLng(new Y.Point(x, y));
      console.log(ll.toString());

   });

   //縮尺変更時のイベント
   ymap.bind("zoomend", function (e) {
      console.log("縮尺が変更されました");
   });

   //住所一覧描画
   makeAdressTable("append_area", ADRESS_DATA);

   //地図表示プログラム
   moveMapToAdress(ADRESS_DATA);
   
   //チェックボックスのプログラム
   flgOnAll("labelOnFlgIdAll", "labelOnFlg")
   
   //ラベルON/OFFプログラム
   labelOnFlg(ADRESS_DATA, "labelOnFlg");

   //ラベルON/OFFチェックボックス有効化
   labelOnOff(ADRESS_DATA);


   //画面下部に住所一覧を表示
   function makeAdressTable(tableID, data) {

      //テーブル表示場所の取得
      let tableRef = document.getElementById(tableID);
      tableRef.innerHTML = 'checkBox';

      //ヘッダーの生成
      let tr = tableRef.insertRow(-1)
      let th = document.createElement('th');
      let div = document.createElement('div');
      let text = document.createTextNode('');


      th = document.createElement('th');
      text = document.createTextNode('倉庫名')
      th.appendChild(text);
      tr.appendChild(th);

      th = document.createElement('th');
      text = document.createTextNode('郵便番号')
      th.appendChild(text);
      tr.appendChild(th);

      th = document.createElement('th');
      text = document.createTextNode('住所')
      th.appendChild(text);
      tr.appendChild(th);

      th = document.createElement('th');
      text = document.createTextNode('場所')
      th.appendChild(text);
      tr.appendChild(th);

      th = document.createElement('th');
      let newInpt = document.createElement('input');
      newInpt.className = "checkOnFlg" + " " + "all";
      newInpt.setAttribute('type', 'checkbox');
      newInpt.setAttribute('value', '100');
      newInpt.setAttribute('id', 'labelOnFlgIdAll');
      newInpt.setAttribute('checked', 'checked');
      let labl = document.createElement('label');
      labl.htmlFor = 'flgAll';
      labl.appendChild(document.createTextNode('表示'));

      div.appendChild(labl);
      div.appendChild(newInpt);
      th.appendChild(div);
      tr.appendChild(th);

      //ボディの生成
      let rowNum = data.length;
      let colNum = 4;

      //表に配列の要素を格納
      for (i = 0; i < rowNum; i++) {

         let newRow = tableRef.insertRow(-1); //行を追加
         for (j = 0; j < colNum; j++) {
            //倉庫名略称は表示しない
            if (j === 1) {
               continue;
            }

            let newCell = newRow.insertCell(-1); //セルを追加
            let newText = document.createTextNode(data[i][j]); //テキストを生成
            newCell.appendChild(newText); //セルにテキストを格納
         }

         //MAPボタン追加処理
         let newCell = newRow.insertCell(-1); //セルを追加
         let newAnc = document.createElement("a"); //<a>要素を生成
         newAnc.className = "adRow" + " " + i; //<a>にクラス名「adRow」を追加
         newAnc.href = "#"; //<a>のhrefを設定 画面トップへ移動
         let newText = document.createTextNode("MAP") //テキストを生成
         newAnc.appendChild(newText); //<a>配下にテキストを格納
         newCell.appendChild(newAnc); //セルに<a>要素を格納

         //表示チェックボックス追加
         let Inpt = document.createElement('input');
         Inpt.setAttribute('type', 'checkbox');
         newCell = newRow.insertCell(-1); //セルを追加
         Inpt.className = "labelOnFlg" + " " + i;
         Inpt.setAttribute('value', i);
         Inpt.setAttribute('id', 'labelOnFlgId' + i);
         Inpt.setAttribute('checked', 'checked');
         newCell.appendChild(Inpt);
         newCell.setAttribute('align', 'center');
      }
   }

   function labelOnOff(data) {
      let labelControlle = document.getElementById("labelon");
      //console.log(labelControlle);

      labelControlle.onclick = function () {
         //ラベルのCSS属性をJavaScriptから操作する
         if (labelControlle.checked) {
            //ONの場合表示する
            //console.log(ymap.systemLayer.features);
            console.log("ラベルON");

            let elemP = document.getElementsByClassName("yolp-tlchp");
            let len = elemP.length;
            for (let i = 0; i < len; i++) {
               elemP[i].style.display = "inline";
               //elemP[i].style.cursor = "default";
            };
         } else {
            //OFFの場合非表示とする

            console.log("ラベルOFF");
            //ラベルを取り除く
           
            //let elemP = document.getElementsByClassName("yolp-tlchp");
            //let len = elemP.length;
            //for (let i = 0; i < len; i++) {
             //  elemP[i].style.display = "none";
               //elemP[i].style.cursor = "default";

            //};
         }
      }
   }

   function moveMapToAdress(data) {
      // class属性値が「adRow」である複数の要素への参照を配列変数「adRowElements」に格納
      let adRowElements = document.getElementsByClassName("adRow");
      // 配列変数「adRowElements」の要素数分ループ処理
      let len = adRowElements.length
      for (let i = 0; i < len; i++) {

         // クリックイベントにイベントハンドラをバインド
         adRowElements[i].onclick = function () {

            // class属性値が「adRow」である要素をクリックした時の処理
            panToMap(data[this.classList[1]][4], data[this.classList[1]][5])
         }

      }
   }

   function flgOnAll(AllflgId, flgsClass) {
      // class属性値が「labelOnFlg all」である要素への参照を配列変数「labelOnFlgAll」に格納  
      let labelOnFlgAll = document.getElementById(AllflgId); //labelOnFlgAll
      // class属性値が「labelOnFlg」である複数の要素への参照を配列変数「labelOnFlgElements」に格納
      let labelOnFlgElements = document.getElementsByClassName(flgsClass); //labelOnFlg

      // チェンジイベントをバインド
      labelOnFlgAll.onchange = function () {
         // class属性値が「labelOnFlg」であるチェックボックスの値を変更した時の処理
         console.log('Allチェックボックスの値が変更されました')

         let flg = labelOnFlgAll.checked;
         let len = labelOnFlgElements.length;
         for (let i = 0; i < len; i++) {
            //class属性値が「labelOnFlg」である複数のチェックボックスを一括でON/OFF
            labelOnFlgElements[i].checked = flg;
         }
      }
   }

   function labelOnFlg(data,flgsClass) {
      // class属性値が「labelOnFlg」である複数の要素への参照を配列変数「labelOnFlgElements」に格納
      let labelOnFlgElements = document.getElementsByClassName(flgsClass); //labelOnFlg

      // 配列変数「labelOnFlgElements」の要素数分ループ処理
      let len = labelOnFlgElements.length
      for (let i = 0; i < len; i++) {

         // クリックイベントにイベントハンドラをバインド
         labelOnFlgElements[i].onchange = function () {
            // class属性値が「labelOnFlg」であるチェックボックスの値を変更した時の処理
            console.log('チェックボックスの値が変更されました')
         }

      }
   }
   //スクロールのアニメーション
   $(function () {
      $('a[href*="#"].adRow').on('click', function () {
         var speed = 300;
         var href = $(this).attr("href");
         var target = $(href == "#" || href == "" ? 'html' : href);
         var position = target.offset().top;
         $('body,html').animate({
            scrollTop: position
         }, speed, 'swing');
         return false;
      });
   });

   //panToイベント

   function panToMap(x, y) {
      //ymap.panTo(new Y.LatLng(x, y), true);
      var p = new Y.LatLng(x, y);
      ymap.setZoom(12, true, p, true);
   }

   //ラベル表示
   function makeLabels(data) {
      let len = data.length;
      for (let i = 0; i < len; i++) {

         //情報格納
         let label = new Y.Label(new Y.LatLng(data[i][4], data[i][5]), data[i][1], {
            draggable: false
         });
         label.bind('click', onclick);

         //ラベルセット
         ymap.addFeature(label);

      }
   }
});
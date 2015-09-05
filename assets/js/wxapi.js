var Wxapi = {};
Wxapi.canUse = false;
var ROOT = 'http://straightoutta.cn/';
Wxapi.setShare = function(data){
	var place =  (data && data.place) || '',
		imgUrl = (data && data.imgUrl) || 'http://straightoutta.cn/img/weixinShare-icon.jpg';
	var wxData = {
		title: '#StaightOutta#我们都来自某一个地方',
		link: ROOT + 'newPage?imgUrl=' + imgUrl,
		imgUrl: imgUrl, 
		desc:'来跟我一起，为你的城市发声！',
		success: function () { 
		},
		cancel: function () {  
		}	
	}
	var wxDataTimeline = {
		title: '#StaightOutta#城市发声行动，我是#StraightOutta# ' + place+ '，你来自哪里？',
		link: ROOT + 'newPage?imgUrl=' + imgUrl,
		imgUrl:imgUrl, 
		success: function () { 
		},
		cancel: function () {  
		}	
	}
	wx.onMenuShareTimeline(wxDataTimeline);
	wx.onMenuShareAppMessage(wxData);
	wx.onMenuShareQQ(wxData);
	wx.onMenuShareWeibo(wxData);
	wx.checkJsApi({
	    jsApiList: ['onMenuShareAppMessage'],
	    success: function (res) {
	    	Wxapi.canUse = true;
	    }
	});
	console.log(wxDataTimeline);
}

Wxapi.getCfg = function(){
	$.getJSON('http://www.qgrace.com/wxauth/',function(data){
		wx.config({
			debug: false,
			appId: data.appId,
			timestamp: data.timestamp,
			nonceStr: data.nonceStr,
			signature: data.signature,
			jsApiList: [
			  'checkJsApi',
			  'onMenuShareTimeline',
			  'onMenuShareAppMessage',
			  'onMenuShareQQ',
			  'onMenuShareWeibo',
			  'hideMenuItems',
			  'showMenuItems',
			  'hideAllNonBaseMenuItem'
			]
		});
		wx.ready(function () {
			Wxapi.setShare({});
		});
	});
}
Wxapi.getCfg();




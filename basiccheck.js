// +----------------------------------------------------------------------+
// | BasicCheck.js   简易表单验证
// +----------------------------------------------------------------------+
// | Author: Neoxone
// +----------------------------------------------------------------------+
// | Site: www.cssass.com
// +----------------------------------------------------------------------+
function BasicCheck(config) {
	var o = (config.tagName && config.tagName == "FORM") ? config : config.form;
	if (!o) return false;
	var self = this;
	this.formNode = o;
	this.outWarm = config.warm ? true : false;
	if (this.outWarm) this.warm = config.warm; //有自定义错误提示,此情况下blur不触发验证，只有submit才触发
	this.blurBindFunc = function() { //设置绑定的方法
		var e = arguments[0] || window.event,
			target = e.target || e.srcElement;
		self.bindCheck(target);
	};
	this.addBindCheck();
	o.onsubmit = function() {
		var ok = true;
		if (config.warm) config.warm("", "");
		var i = self.items.length;
		while (i--) {
			ok = self.bindCheck(self.items[i]) && ok;
		};
		if (config.addition) ok = config.addition() && ok;
		if (!ok) return false;
		if (config.ajaxReq) { //有异步请求就不走Form提交
			try {
				config.ajaxReq();
			} catch (e) {
				console.log("异步表单error", e);
			}
			return false;
		}
	};
};
BasicCheck.prototype = {
	addBindCheck: function() {
		var self = this;
		this.items = $tag("*[needcheck]", this.formNode);
		if (!this.outWarm) {
			events.addEvent(this.items, "blur", this.blurBindFunc);
		};
	},
	bindCheck: function(o) {
		var errorTip = $class("errorTip", o.parentNode);
		if (errorTip.length > 0) {
			errorTip[0].innerHTML = "";
			addClass(errorTip[0], "hide");
		};
		this.realValue = String.trim ? o.value.trim() : o.value.replace(/(^\s*)|(\s*$)/g, "");
		var ok = true;
		var allowNull = o.getAttribute("allownull");
		if (allowNull == null) {
			ok = this.ckeckNull(o); //验证空
			if (!ok) return false;
		}
		if (this.realValue === "") return true; //为空则不继续验证。（允许为空）
		var checkLength = o.getAttribute("limit");
		if (checkLength) {
			var range = checkLength.split(",");
			ok = this.checkLength(o, range); //验证长度
			if (!ok) return false;
		};
		var checkReg = o.getAttribute("reg"); //验证正则
		if (checkReg) {
			var regexp = new RegExp(/checkReg/);
			ok = this.checkReg(o, checkReg);
			if (!ok) return false;
		}
		var watchnodeName = o.getAttribute("watchnode"); //验证一致性
		if (watchnodeName) {
			var node = $tag("*[name=" + watchnodeName + "]")[0];
			ok = this.checkUnity(o, node);
			if (!ok) return false;
		}
		var checkFuncName = o.getAttribute("checkfunc"); //自定义方法验证
		if(checkFuncName) {
			ok = this.checkFunc(o,checkFuncName);
			if (!ok) return false;
		}
		return true;
	},
	ckeckNull: function(o) {
		if (this.realValue === "") {
			var msg = o.getAttribute("nullmsg") || "不能为空";
			this.warm(o, msg);
			return false;
		}
		return true;
	},
	checkLength: function(o, range) {
		var length = this.realValue.replace(/[\u4e00-\u9fa5]/g, 'xx').length; //此处一个中文字符算二个字符
		if (length > range[1] || length < range[0]) {
			var msg = o.getAttribute("limitmsg") || "长度限制在" + range[0] + "到" + range[1] + "个字符之间！";
			this.warm(o, msg);
			return false;
		}
		return true;
	},
	checkUnity: function(o, node) {
		if (o.value !== node.value) {
			var msg = o.getAttribute("watchmsg");
			this.warm(o, msg);
			return false;
		}
		return true;
	},
	checkReg: function(o, regexp) {
		if (!this.realValue.match(regexp)) {
			var msg = o.getAttribute("errormsg");
			this.warm(o, msg);
			return false;
		}
		return true;
	},
	checkFunc : function(o,func){
		if(!window[func].call(this)){
			var msg = o.getAttribute("funcmsg");
			if(msg) this.warm(o, msg);
			return false;
		}
		return true;
	},
	warm: function(o, msg) {
		var infoBox = null;
		var nodeid = o.getAttribute("errornode");
		if (nodeid) {
			infoBox = $id(nodeid);
			addClass(infoBox, "errorTip");
		} else {
			infoBox = $class("errorTip", o.parentNode);
			if (infoBox.length < 1) {
				infoBox = document.createElement("I");
				addClass(infoBox, "errorTip");
				o.parentNode.appendChild(infoBox);
			} else {
				infoBox = infoBox[0];
			}
		}
		removeClass(infoBox, "hide");
		infoBox.innerHTML = msg;
	}
};
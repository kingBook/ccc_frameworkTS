var document=fl.getDocumentDOM();
var selections=document.selection;
//.jsfl文件路径
var scriptURI=fl.scriptURI;
//.jsfl所在的文件夹路径
var scriptDirectory=scriptURI.substring(0,scriptURI.lastIndexOf("/")+1);
//取CocosCreator项目文件夹路径
var exportFolderPath=scriptURI.substring(0,scriptURI.lastIndexOf("/packages")+1);
//导出到CocosCreator项目文件夹内的文件夹路径
exportFolderPath+="assets/textures";
//最大的纹理限制
var maxTextureSize={ width:2048, height:2048 };
fl.outputPanel.clear();
//--------------------------------------------------------------------------------------------
var funcs={};
funcs.exportMcToPng=function(callback){
	if(selections&&selections.length>0){
		var isExportComplete=false;
		for(var i=0;i<selections.length;i++){
			var element=selections[i];
			if(element.elementType=="instance"){
				if(element.instanceType=="symbol"){
					isExportComplete=funcs.exportSymbolItem(element);
				}
			}else{
				alert("Error: the selected object is not symbol");
			}
		}
		if(isExportComplete){
			alert("Export complete");
			
		}
	}else{
		alert("Error: no object is selected");
	}
}

funcs.exportSymbolItem=function(element){
	const linkageClassName=element.libraryItem.linkageClassName;
	const elementName=element.name;
	
	var libraryItemName=element.libraryItem.name;
	libraryItemName=libraryItemName.substr(libraryItemName.lastIndexOf("\/")+1);
	
	//导出png的名称
	var exportName=elementName?elementName:(linkageClassName?linkageClassName:libraryItemName);
	//exportName+="png";
	const filePath=exportFolderPath+"/"+exportName;
	
	if(FLfile.createFolder(exportFolderPath)){
		//fl.trace("Folder has been created");
	}else{
		//fl.trace("Folder already exists");
	}
	
	/*const totalFrames=element.libraryItem.timeline.frameCount;
	if(totalFrames<=1){
		funcs.deleteOldFile(filePath);
		//exportInstanceToPNGSequence方法，只允许选中一个
		document.selectNone();
		element.selected=true;
		//只有一帧时，直接导出位图
		document.exportInstanceToPNGSequence(filePath+".png");
		//创建空的xml，使unity能正确的改变纹理类型
		FLfile.write(filePath+".xml","<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<TextureAtlas imagePath=\""+exportName+".png"+"\"></TextureAtlas>");
		//还原选择项
		document.selection=selections;
	}else{*/
		
		//多帧时生成位图表
		if(funcs.isOverflowed(element,maxTextureSize.width,maxTextureSize.height)){
			return funcs.exportEveryFrame(element,exportFolderPath,maxTextureSize.width,maxTextureSize.height,exportName);
		}else{
			funcs.deleteOldFile(filePath);
			return funcs.exportAllFrameToImage(element,filePath,maxTextureSize.width,maxTextureSize.height,exportName);
		}
	//}
	return false;
}

funcs.deleteOldFile=function(filePath){
	//删除.png
	const pngPath=filePath+".png";
	if(FLfile.exists(pngPath))FLfile.remove(pngPath);
	//删除png.meta文件
	const pngMetaPath=filePath+".png.meta";
	if(FLfile.exists(pngMetaPath))FLfile.remove(pngMetaPath);
	//删除.plist
	const plistPath=filePath+".plist";
	if(FLfile.exists(plistPath))FLfile.remove(plistPath);
	//删除plist.meta
	const plistMetaPath=filePath+".plist.meta";
}

//所有帧导出为一张图
funcs.exportAllFrameToImage=function(element,filePath,maxSheetWidth,maxSheetHeight,exportName){
	var exporter=new SpriteSheetExporter();
	exporter.addSymbol(element,0);
	exporter.allowTrimming=true;
	exporter.algorithm="basic";//basic | maxRects
	exporter.layoutFormat="Starling";//Starling | JSON | cocos2D v2 | cocos2D v3
	exporter.autoSize=true;
	exporter.stackDuplicateFrames=true;
	//exporter.allowRotate=true;
	exporter.borderPadding=5;
	exporter.shapePadding=5;
	exporter.maxSheetWidth=maxSheetWidth;
	exporter.maxSheetHeight=maxSheetHeight;
	var imageFormat={format:"png",bitDepth:32,backgroundColor:"#00000000"};
	exporter.exportSpriteSheet(filePath,imageFormat,true);
	//生成.plist
	funcs.generatePlist(filePath,exportName,exportName,exporter.sheetWidth,exporter.sheetHeight,true,true);
	return true;
}

//每帧一张图导出所有帧
funcs.exportEveryFrame=function(element,exportFolderPath,maxSheetWidth,maxSheetHeight,exportName){
	var s=funcs.mulPngAnimXml_beginExport();
	var frameCount=element.libraryItem.timeline.frameCount;
	for(var i=0;i<frameCount;i++){
		//帧编号字符串
		var frameNOString=i+"";
		//小于四位，在前面加"0"
		if(frameNOString.length<4){
			const zeroCount=4-frameNOString.length;
			for(var j=0;j<zeroCount;j++){
				frameNOString="0"+frameNOString;
			}
		}
		//导出的文件路径
		const filePath=exportFolderPath+"/"+exportName+frameNOString;
		funcs.deleteOldFile(filePath);
		var exporter=new SpriteSheetExporter();
		exporter.addSymbol(element,"",i,i+1);
		exporter.allowTrimming=true;
		exporter.algorithm="basic";//basic | maxRects
		exporter.layoutFormat="Starling";//Starling | JSON | cocos2D v2 | cocos2D v3
		exporter.autoSize=true;
		exporter.stackDuplicateFrames=true;
		//exporter.allowRotate=true;
		exporter.borderPadding=5;
		exporter.shapePadding=5;
		exporter.maxSheetWidth=maxSheetWidth;
		exporter.maxSheetHeight=maxSheetHeight;
		
		if(!exporter.overflowed){
			var imageFormat={format:"png",bitDepth:32,backgroundColor:"#00000000"};
			exporter.exportSpriteSheet(filePath,imageFormat,true);
			//生成.plist
			funcs.generatePlist(filePath,exportName+frameNOString,exportName,exporter.sheetWidth,exporter.sheetHeight,true,false);
			s+=funcs.mulPngAnimXml_frameExport(exportName+frameNOString);
		}else{
			//单帧超出纹理大小限制
			var errorMsg="Error: frame "+(i+1)+" of \'"+exportName+"\' exceeds the texture size limit of "+maxTextureSize.width+"x"+maxTextureSize.height+" cancelled";
			fl.trace(errorMsg);
			alert(errorMsg);
			return false;
		}
	}
	s+=funcs.mulPngAnimXml_EndExport();
	//生成记录由多个png组成动画的xml
	FLfile.write(exportFolderPath+"/"+exportName+".multipleImageAnim",s);
	return true;
}


funcs.mulPngAnimXml_beginExport=function(){
	var s = '<?xml version="1.0" encoding="utf-8"?>\n';
	    s+= '<root>\n';
	return s;
}

funcs.mulPngAnimXml_frameExport=function(frameName){
	var s = '\t<name>'+frameName+'</name>\n';
	return s;
}

funcs.mulPngAnimXml_EndExport=function(){
	var	s = '</root>';
	return s;
}

//导出所有帧时，是否超出指定大小
funcs.isOverflowed=function(element,maxSheetWidth,maxSheetHeight){
	var exporter=new SpriteSheetExporter();
	exporter.addSymbol(element,0);
	exporter.allowTrimming=true;
	exporter.algorithm="basic";//basic | maxRects
	exporter.layoutFormat="Starling";//Starling | JSON | cocos2D v2 | cocos2D v3
	exporter.autoSize=true;
	exporter.stackDuplicateFrames=true;
	//exporter.allowRotate=true;
	exporter.borderPadding=5;
	exporter.shapePadding=5;
	exporter.maxSheetWidth=maxSheetWidth;
	exporter.maxSheetHeight=maxSheetHeight;
	return exporter.overflowed;
}
//--------------------------------------------------------------------------------------------
funcs.generatePlist=function(filePath,exportName,metaFileName,sheetWidth,sheetHeight,isDelStarlingXml,isConnectFrameName){
	var xmlPath=filePath+".xml";
	var starlingXml=eval(FLfile.read(xmlPath).split( '\n' ).slice( 1 ).join( '\n' ));
	
	var s=funcs.cocos2dv2_beginExport();
	
	var subTextureNodes=starlingXml.SubTexture;
	const len=subTextureNodes.length();
	var pivotX=0;
	var pivotY=0;
	for(var i=0;i<len;i++){
		var subTextureNode=subTextureNodes[i];
		if(i==0){
			pivotX=Number(subTextureNode.@pivotX);
			pivotY=Number(subTextureNode.@pivotY);
		}
		var name=subTextureNode.@name;
		var x=Number(subTextureNode.@x);
		var y=Number(subTextureNode.@y);
		var width=Number(subTextureNode.@width);
		var height=Number(subTextureNode.@height);
		
		var frameXStr=subTextureNode.@frameX;
		if(frameXStr==null)frameXStr="0";
		var frameX=Number(frameXStr);
		var frameYStr=subTextureNode.@frameY;
		if(frameYStr==null)frameYStr="0";
		var frameY=Number(frameYStr);
		
		var frameWidthStr=subTextureNode.@frameWidth;
		if(frameWidthStr==null)frameWidthStr="0";
		var frameWidth=Number(frameWidthStr);
		var frameHeightStr=subTextureNode.@frameHeight;
		if(frameHeightStr==null)frameHeightStr="0";
		var frameHeight=Number(frameHeightStr);
		
		var poX=(pivotX+frameX)/width;
		var poY=(height-pivotY-frameY)/height;
		
		var frame={
			id:(isConnectFrameName?exportName+name:exportName),
			frame:{x:x,y:y,w:width,h:height},
			offsetInSource:{x:-frameX,y:-frameY},
			sourceSize:{w:frameWidth,h:frameHeight},
			anchor:{x:poX,y:poY},
			rotated:false
		};
		s+=funcs.cocos2dv2_frameExport(frame);
	}
	
	var meta={
		image:metaFileName+".png",
		sheetWidth:sheetWidth,
		sheetHeight:sheetHeight
	};
	s+=funcs.cocos2dv2_endExport(meta);
	
	//删除starlingXml
	if(isDelStarlingXml && FLfile.exists(xmlPath)){
		FLfile.remove(xmlPath);
	}
	//.plist写入到本地磁盘
	FLfile.write(filePath+".plist",s);
}

funcs.cocos2dv2_beginExport=function(){
	var s = '<?xml version="1.0" encoding="utf-8"?>\n';
	    s+= '<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n';
	    s+= '<plist version="1.0">\n';
	    s+= '\t<dict>\n';
	    s+= '\t\t<key>frames</key>\n';
	    s+= '\t\t<dict>\n';
	return s;
}

funcs.cocos2dv2_frameExport=function(frame){
//	fl.trace("==== frameExport");
//	fl.trace(frame.id);
//	fl.trace(frame.frame.x);
//	fl.trace(frame.frame.y);
//	fl.trace(frame.frame.w);
//	fl.trace(frame.frame.h);
//	fl.trace(frame.offsetInSource.x);
//	fl.trace(frame.offsetInSource.y);
//	fl.trace(frame.sourceSize.w);
//	fl.trace(frame.sourceSize.h);
//	fl.trace(frame.rotated);
//	fl.trace(frame.anchor.x);
//	fl.trace(frame.anchor.y);
//	fl.trace("---- frameExport");

	var s ='\t\t\t<key>' + frame.id + '</key>\n';
	
	s += '\t\t\t<dict>\n';

	s += '\t\t\t\t<key>frame</key>\n';
	var scrx = frame.sourceSize.w - frame.frame.w;
	var scry = frame.sourceSize.h - frame.frame.h;
	s += '\t\t\t\t<string>{{' + frame.frame.x + ',' + frame.frame.y + '},{' + frame.frame.w + ',' + frame.frame.h + '}}</string>\n';

	s += '\t\t\t\t<key>offset</key>\n';
	var srcofsx = 0 - frame.offsetInSource.x;
	var srcofsy = 0 - frame.offsetInSource.y;
	s += '\t\t\t\t<string>{' + srcofsx + ',' + srcofsy + '}</string>\n';

	s += '\t\t\t\t<key>rotated</key>\n';
	s += '\t\t\t\t<' + frame.rotated + '/>\n';

	s += '\t\t\t\t<key>sourceColorRect</key>\n';
	var scrx = frame.sourceSize.w - frame.frame.w;
	var scry = frame.sourceSize.h - frame.frame.h;
	s += '\t\t\t\t<string>{{' + scrx + ',' + scry + '},{' + frame.frame.w + ',' + frame.frame.h + '}}</string>\n';

	s += '\t\t\t\t<key>sourceSize</key>\n';
	s += '\t\t\t\t<string>{' + frame.frame.w + ',' + frame.frame.h + '}</string>\n';
	
	s += '\t\t\t\t<key>anchor</key>\n';
	s += '\t\t\t\t<string>{' + frame.anchor.x + ',' + frame.anchor.y + '}</string>\n';
	
	s += '\t\t\t</dict>\n';

	return s;
}

funcs.cocos2dv2_endExport=function(meta){
//	fl.trace("==== endExport");
//	fl.trace(meta.image);
//	fl.trace(meta.sheetWidth);
//	fl.trace(meta.sheetHeight);
//	fl.trace("---- endExport");
	
	var s = '\t\t</dict>\n';
	s += '\t\t<key>metadata</key>\n';

	s += '\t\t<dict>\n';

	s += '\t\t\t<key>format</key>\n';
	s += '\t\t\t<integer>2</integer>\n';

	s += '\t\t\t<key>realTextureFileName</key>\n';
	s += '\t\t\t<string>' + meta.image + '</string>\n';

	s += '\t\t\t<key>size</key>\n';
	s += '\t\t\t<string>{' + meta.sheetWidth + ',' + meta.sheetHeight + '}</string>\n';

	s += '\t\t\t<key>textureFileName</key>\n';
	s += '\t\t\t<string>' + meta.image + '</string>\n';

	s += '\t\t</dict>\n';

	s += '\t</dict>\n';
	s += '</plist>\n';

	return s;
}
//--------------------------------------------------------------------------------------------
funcs.exportMcToPng();
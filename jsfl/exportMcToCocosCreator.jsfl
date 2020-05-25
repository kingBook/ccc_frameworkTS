var document=fl.getDocumentDOM();
var selections=document.selection;
//.jsfl所在的目录路径
var scriptURI=fl.scriptURI;
//取unity项目目录
var exportFolderPath=scriptURI.substring(0,scriptURI.lastIndexOf("/jsfl")+1);
//导出到unity项目目录的路径
//exportFolderPath+="Assets/Textures";
exportFolderPath+="assets/textures";
//--------------------------------------------------------------------------------------------
var funcs={};
funcs.exportMcToPng=function(){
	if(selections&&selections.length>0){
		var isHasExport=false;
		for(var i=0;i<selections.length;i++){
			var element=selections[i];
			if(element.elementType=="instance"){
				if(element.instanceType=="symbol"){
					funcs.exportSymbolItem(element);
					isHasExport=true;
				}
			}else{
				alert("error: the selected object is not symbol");
			}
		}
		if(isHasExport){
			alert("export complete");
		}
	}else{
		alert("error: no object is selected");
	}
}

funcs.exportSymbolItem=function(element){
	const linkageClassName=element.libraryItem.linkageClassName;
	const elementName=element.name;
	const libraryItemName=element.libraryItem.name;
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
		var maxSheetWidth=2048;
		var maxSheetHeight=2048;
		if(funcs.isOverflowed(element,maxSheetWidth,maxSheetHeight)){
			funcs.exportEveryFrame(element,exportFolderPath,exportName);
		}else{
			funcs.deleteOldFile(filePath);
			funcs.exportAllFrameToImage(element,filePath);
		}
	//}
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
funcs.exportAllFrameToImage=function(element,filePath,maxSheetWidth,maxSheetHeight){
	var exporter=new SpriteSheetExporter();
	exporter.addSymbol(element,0);
	exporter.canTrim=false;
	exporter.algorithm="basic";//basic | maxRects
	exporter.layoutFormat="cocos2D v2";//Starling | JSON | cocos2D v2 | cocos2D v3
	exporter.autoSize=true;
	exporter.maxSheetWidth=maxSheetWidth;
	exporter.maxSheetHeight=maxSheetHeight;
	var imageFormat={format:"png",bitDepth:32,backgroundColor:"#00000000"};
	exporter.exportSpriteSheet(filePath,imageFormat,true);
}

//每帧一张图导出所有帧
funcs.exportEveryFrame=function(element,exportFolderPath,exportName){
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
		exporter.canTrim=false;
		exporter.algorithm="basic";//basic | maxRects
		exporter.layoutFormat="cocos2D v2";//Starling | JSON | cocos2D v2 | cocos2D v3
		exporter.autoSize=true;
		exporter.maxSheetWidth=2048;
		exporter.maxSheetHeight=2048;
		var imageFormat={format:"png",bitDepth:32,backgroundColor:"#00000000"};
		exporter.exportSpriteSheet(filePath,imageFormat,true);
	}
}

//导出所有帧时，是否超出指定大小
funcs.isOverflowed=function(element,maxSheetWidth,maxSheetHeight){
	var exporter=new SpriteSheetExporter();
	exporter.addSymbol(element,0);
	exporter.canTrim=false;
	exporter.algorithm="basic";//basic | maxRects
	exporter.layoutFormat="cocos2D v2";//Starling | JSON | cocos2D v2 | cocos2D v3
	exporter.autoSize=true;
	exporter.maxSheetWidth=maxSheetWidth;
	exporter.maxSheetHeight=maxSheetHeight;
	return exporter.overflowed;
}
//--------------------------------------------------------------------------------------------
funcs.exportMcToPng();
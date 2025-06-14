/**************************************************
Trivantis (http://www.trivantis.com)
**************************************************/

function Entry(fdesc, href, type, id) {
  this.desc = fdesc
  if( href.indexOf( 'javascript:' ) == 0 )
    this.href = href
  else
    this.href = 'javascript:trivExitPage("' + href + '")'
  this.id = -1
  this.navObj = null
  this.iconImg = null
  this.entryImg = null
  this.isLast = 0
  this.frame = -1
  this.hidden = false
  this.isOpen = false
  this.c = new Array
  this.nC = 0
  this.entryLeftSide = ""
  this.entryLevel = 0
  this.parent = 0
  this.isInitial = false
  this.isFolder = true
  this.plateId = typeof(id)=='number' ? id : -1;
  this.ptstat = 0;
  if( type ) this.iType = type
  else this.iType = "page"
  this.bInherited = false;
}

{ // Setup prototypes
var p=Entry.prototype
p.init = InitEntry
p.setState = setStateFolder
p.moveState = moveStateFolder
p.addChild = addChild
p.createIndex = createEntryIndex
p.hide = hide
p.display = display
p.initMode = initMode
p.initLayer = initLayer
p.setEntryDraw = setEntryDraw
p.entryIcon = entryIcon
p.treeIcon = entryTreeIcon
p.clickOn = clickOnEntry
p.locateNode = locateNode
p.getDoc = getDoc
p.getStatusImage = getStatusImage
p.getStatusVisibility = getStatusVisibility
p.refresh = ObjEntryRefresh
p.rv = ObjEntryRV
}

function setStateFolder(isOpen) {
  this.isOpen = isOpen
  propagateChangesInState(this)
}

function moveStateFolder(isOpen) {
  var ht
  var i=0
  var j=0
  var parent = 0
  var thisentry = 0
  var found = false
  var width = 0
  ht = 0
  for (i=0; i < this.nC; i++) {
    if (!noDocs || this.c[i].isFolder){
      ht += this.c[i].navObj.clip.height
      if (isOpen) width = Math.max(width,this.c[i].navObj.clip.width)
    }
  }
  if (!isOpen) ht = -ht
  this.navObj.clip.height += ht
  if (isOpen) this.navObj.clip.width = Math.max(width, this.navObj.clip.width)
  thisentry = this
  parent = thisentry.parent
  for (i=0; i < this.entryLevel; i++){
    parent.navObj.clip.height += ht
    if (isOpen) parent.navObj.clip.width = Math.max(width, parent.navObj.clip.width)
    found = false
    for (j=0; j < parent.nC; j++){
      if (!noDocs || parent.c[j].nC != null){
        if (found) parent.c[j].navObj.moveBy(0,ht)
        else if (parent.c[j] == thisentry) found = true
      }
    }
    thisentry = parent
    parent = thisentry.parent
  }
  newHeight= fT.navObj.clip.height
  topLayer.clip.height = newHeight
  topLayer.clip.width = Math.max(topLayer.clip.width,fT.navObj.clip.width)
  newHeight = newHeight + gap
  frameHeight = thisFrame.innerHeight
  if (isOpen){
    if (doc.height < newHeight) doc.height = newHeight
    else if (newHeight < frameHeight) {
      doc.height = frameHeight
      thisFrame.scrollTo(0,0)
    }
    else if (doc.height > newHeight + 0.5*frameHeight){
      doc.height = doc.height*0.5 + (newHeight + 0.5*frameHeight)*0.5
    }
  }
}

function propagateChangesInState(folder) {
  var i=0
  if (folder.nC && treeLines == 1) {
    if (!folder.entryImg){
      if (doc.images) folder.entryImg = doc.images["treeIcon"+folder.id]
    }
    if (folder.entryLevel > 0) folder.entryImg.src = folder.treeIcon()
  }
  if (folder.isOpen && folder.isInitial){
    for (i=0; i<folder.nC; i++)
      if (!noDocs || folder.c[i].isFolder) folder.c[i].display()
  }
  else {
    if (folder.isInitial)
      for (i=0; i<folder.nC; i++)
        if (!noDocs || folder.c[i].isFolder) folder.c[i].hide()
  }
  if (!folder.iconImg){
    if (doc.images) folder.iconImg = doc.images["entryIcon"+folder.id]
  }
}

function getStatusImage( i ){
	return iPA["$"+i].src;
}

function getStatusVisibility( i ){
	return iPA["$"+i].style.visibility;
}

function getDoc()
{
	return doc;
}

function display() {
  var i=0
  if (!this.navObj) this.navObj = doc.all["entry" + this.id]
    this.navObj.style.display = "block"
  if (this.isInitial && this.isOpen)
    for (i=0; i < this.nC; i++)
      if (!noDocs || this.c[i].isFolder) this.c[i].display()
}

function hide() {
  var i = 0
  if (!this.navObj) this.navObj = doc.all["entry" + this.id]
  this.navObj.style.display = "none"
  if (this.isInitial)
    for (i=this.nC-1; i>-1; i--){
      if (!noDocs || this.c[i].isFolder) this.c[i].hide()
    }
}

function InitEntry(level, lastentry, leftSide, doc, prior) {
  this.createIndex()
  this.entryLevel = level
  if(!this.isFolder) this.isInitial = true
  if (level>0) {
    this.isLast = lastentry
    tmpIcon = this.treeIcon()
    if (this.isLast == 1) tmp2Icon = iTA["b"].src
    else tmp2Icon = iTA["vl"].src
    if (treeLines == 0) tmp2Icon = iTA["b"].src
    if (this.hidden == false) {
      if (level == 1 && treeLines == 0 && noTopFolder) this.setEntryDraw(leftSide, doc, prior)
      else {
        auxEv = ""
        if (this.isFolder && treeLines == 1 ){
          if( frameParent == "" ) {
            auxEv = ancStart + "href='javascript:void(null);' onClick='return clickOnEntry("+this.id+");' aria-label='minimize or maximize node'>"
            auxEv += "<img name='treeIcon" + this.id + "' src='" + tmpIcon + "' border='0' align='absmiddle' alt='' />"
          }
          else {
            if( scrollWnd ) {
              if( scrollWnd.tocFrame ) auxEv = ancStart + "href='javascript:void(null);' onClick='return " +scrollWnd.name+"Object.foldertree.clickOn("+this.id+");' aria-label='minimize or maximize node'>"
              else auxEv = ancStart + "href='javascript:void(null);' onClick='return clickOnEntry("+this.id+");' aria-label='minimize or maximize node'>"
            }
            else auxEv = ancStart + "href='javascript:void(null);' onClick='return " +frameParent + ".clickOnEntry("+this.id+");' aria-label='minimize or maximize node'>"
            auxEv += "<img name='treeIcon" + this.id + "' src='" + tmpIcon + "' border='0' align='absmiddle' alt='' />"
          }
          auxEv += "</a>"
        }
        else auxEv = "<img name='space" + this.id + "' alt='' src='" + tmpIcon + "' align='absmiddle' />"
        this.setEntryDraw(leftSide + auxEv, doc, prior)
        if (this.isFolder) leftSide +=  "<img name='fldrSpace" + this.id + "' alt='' src='" + tmp2Icon + "' align='absmiddle' />"
      }
    }
  }
  else this.setEntryDraw("", doc, prior)
  if (this.isFolder) {
    this.entryLeftSide = leftSide
    if (this.nC > 0 && this.isInitial) {
      level = level + 1
      for (var i=0 ; i < this.nC; i++) {
        this.c[i].parent = this
        if (noDocs) {
          newLastEntry = 1
          for (var j=i+1; j < this.nC; j++)
            if (this.c[j].isFolder) newLastEntry = 0
        }
        else {
          newLastEntry = 0
          if (i == this.nC-1) newLastEntry = 1
        }
        if (i==0 && level == 1 && noTopFolder) newLastEntry = -1
        if (!noDocs || this.c[i].isFolder) {
          this.c[i].init(level, newLastEntry, leftSide, doc, prior)
        }
      }
    }
  }
}

function setEntryDraw(leftSide, doc, prior) 
{
    var strbuf = ""
    var statusState = "";
    var ptStatus = '';
    var bNavable = 1
    var styCursor = ''
    if (prior) nEntries--;
    fullLink = ""

    if (this.plateId != -1 && scrollWnd)
    {
        ptStatus = window.parent.trivPageTracking.GetRangeStatus(this.plateId);
        if (scrollWnd.navMode == 3 || (scrollWnd.navMode == 2 && ptStatus != 'complete'))     // navMode != free
        {
            styCursor = ' style="cursor: default;"'
            bNavable = 0
		}
    }

    if (this.href && bNavable) 
    {
        linkText = this.href
        int1 = linkText.indexOf("this\.id")
        if (int1 != -1) 
            linkText = linkText.substring(0,int1) + this.id + linkText.substring(int1+7)
        fullLink = " href='" + linkText + "' " + targetFrameParm
    }
    else
        fullLink = " href='javascript:void(null);' "

    if (noFrame && bNavable)
        fullLink = " href='" + this.href + "'"

    strbuf += "<div id='entry" + this.id + "' style='position:static;'>"
    strbuf += "<table border='0' cellspacing='0' cellpadding='0'><tr><td valign='middle' nowrap>"
    strbuf += leftSide + "</td><td valign='middle' nowrap>" + ancStart + fullLink + styCursor + " aria-hidden='true' tabindex='-1'>"
  
    if( this.plateId!=-1 && scrollWnd && scrollWnd.arrStatusImages)
    {
        // LD-6901: Configured the status lable using public strings
        if (ptStatus == "notstarted")
            statusState = trivstrSTATNS;
        else if (ptStatus == 'inprogress')
            statusState = trivstrSTATIP;
        else if (ptStatus == 'complete')
            statusState = trivstrSTATC;
  
        strbuf+= "<img id='TOCPTIND" + this.plateId + "' alt='' name='statusIcon" + this.id + "' src='";
        strbuf+= this.getStatusImage(this.ptstat);
        strbuf+= "' height='18px' border='0' align='absmiddle' " + "style='visibility:" + this.getStatusVisibility(this.ptstat) + ";' />"; 
    }
  
    if (showIcons) 
    {
        strbuf += "<img name='entryIcon" + this.id + "' "
        var iA = iNA
        tmpIcon = this.entryIcon("",iA)
        strbuf += "src='" + tmpIcon + "' border='0' align='absmiddle' />"
    }
  
    var space = gap
    hspace = parseInt("" + (space/2 + .5) + "", 10)
    wspace = 1
    if (hspace*2 == space) wspace = 2
    hspace = hspace - 1;
    //var blankIcon = "<img border='0' align='absmiddle' name='blankImg" + this.id + "' alt='' height='" + wspace + "' width='" + wspace + "' src='" + iTA["b"].src + "' hspace='" + hspace + "' />"
    //strbuf += blankIcon
    strbuf += "</a></td><td valign='middle' nowrap>"
    if (this.href)
    {
        // LD-6901: Configured the static lable using public strings
    	var plateType = " ";
	
	    if(this.iType == "page")
            plateType += trivstrPAGE+" ";
	    else if(this.iType == "sect")
            plateType += trivstrSECTION+" ";
	    else if(this.iType == "chap")
            plateType += trivstrCHAPTER+" ";
	
        strbuf += ancStart + fullLink + styCursor + " aria-label='" + statusState + plateType + this.desc + "'>" + this.desc + "</a>"
    }
    else
        strbuf += this.desc
    strbuf += "</td></tr></table>\n"
    strbuf += "</div>"
    if (this.entryLevel == 0 && noTopFolder) 
        strbuf = "<div id='entry" + this.id + "'></div>"
    this.navObj = null
    if (this.isFolder)
        this.entryImg = null
    this.iconImg = null
    if (!prior) 
        strbufarray[this.id] = strbuf
    else 
    {
        strbufarray[strbufIndex]=strbuf
        strbufIndex++
        nEntries++
    }
}

function createEntryIndex(){
  this.id = nEntries
  indexOfEntries[nEntries] = this
  nEntries++
}

function entryTreeIcon (){
  iName = ""
  if (this.isFolder) {
    if (this.isOpen) {
      if (this.isLast == 0) iName = "mn"
      else if (this.isLast == 1) iName = "mln"
      else iName = "mfn"
    }
    else {
      if (this.isLast == 0) iName = "pn"
      else if (this.isLast == 1) iName = "pln"
      else iName = "pfn"
    }
    folderChildren = false
    if( this.nC ) folderChildren = true
    if (!folderChildren) {
      if (this.isLast == 0) iName = "n"
      else if (this.isLast == 1) iName = "ln"
      else iName = "fn"
    }
  }
  else {
    if (this.isLast == 0) iName = "n"
    else if (this.isLast == 1) iName = "ln"
    else iName = "fn"
  }
  if (treeLines == 0) iName = "b"
  tmpIcon = iTA[iName].src
  return tmpIcon
}

function entryIcon(over,iA){
  tmpIcon = ""
  tmpIcon = iA[this.iType].src
  if (tmpIcon == "") tmpIcon = iTA["b"].src
  return tmpIcon;
}

function clickOnEntry(folderId){
  var cF = 0
  var state = 0
  cF = indexOfEntries[folderId]
  if (!cF) return false;
  if (!cF.navObj) cF.navObj = doc.all["entry" + cF.id]
  state = cF.isOpen
  if (!state) {
    if (cF.isInitial == false) {
      if(cF.nC > 0) {
        prior = cF.navObj
        level = cF.entryLevel
        leftSide = cF.entryLeftSide
        strbufarray = new Array
        strbufIndex = 0
        for (var i=0 ; i < cF.nC; i++) {
          cF.c[i].parent = cF
          if (i == cF.nC-1) newLastEntry = 1
          else last = 0
          if (noDocs) {
            newLastEntry = 1
            for (var j=i+1; j < cF.nC; j++)
              if (cF.c[j].isFolder) newLastEntry = 0
          }
          else {
            newLastEntry = 0
            if (i == cF.nC-1) newLastEntry = 1
          }
          if (!noDocs || cF.c[i].isFolder){
            cF.c[i].init(level + 1, newLastEntry, leftSide, doc, prior)
            needRewrite = true
          }
        }
        htmlStr = strbufarray.join("")
        if( prior.insertAdjacentHTML ) {
          prior.insertAdjacentHTML("AfterEnd",htmlStr)
        }
        else {
          var r = prior.ownerDocument.createRange();
          r.setStartBefore(prior);
          var parsedHTML = r.createContextualFragment(htmlStr);
          if (prior.nextSibling) 
            prior.parentNode.insertBefore(parsedHTML,prior.nextSibling);
          else 
            prior.parentNode.appendChild(parsedHTML);
        }
        cF.setState(!state)
        cF.isInitial = true
      }
    }
    else cF.setState(!state)
  }
  else cF.setState(!state)
  if (!state && modalClick && (cF.entryLevel > 0)) {
    for (i=0; i < cF.parent.nC; i++) {
      if (cF.parent.c[i].isOpen && (cF.parent.c[i] != cF)) {
        cF.parent.c[i].setState(false)
      }
    }
  }
  doc.close()
    
  if( scrollWnd != null ) {
    if( topLayer ) scrollWnd.activate(topLayer.clip.width, topLayer.clip.height+gap, false)
    else scrollWnd.activate(null,null,false)
  }
  return false;
}

function initMode() {
  var i=0
  if (initialMode == 2) {
    if (this.isFolder) this.isOpen = true
    this.isInitial = true
  }
  if (this.isFolder) {
    for (i=0; i<this.nC; i++){
      this.c[i].initMode()
      if (this.c[i].isOpen && this.c[i].isInitial){
        this.isOpen = true
        this.isInitial = true
      }
    }
  }
}

function initializeDocument() {
  if (firstInitial) {
    if (initialMode == 0) {
      fT.isInitial = false
      fT.isOpen = false
    }
    if (initialMode == 1){
      fT.isInitial = true
      fT.isOpen = true
    }
    fT.initMode()
  }
  prior = null
  fT.init(0, 1, "", doc, prior)
  firstInitial = false
}

function initLayer() {
  var i
  var ht
  var oldyPos
  var width = 0
  if (!this.parent) layer = topLayer
  else layer = this.parent.navObj
  this.navObj = layer.document.layers["entry"+this.id]
  this.navObj.top = doc.yPos
  this.navObj.visibility = "inherit"
  if (this.nC > 0 && this.isInitial) {
    doc.yPos += this.navObj.document.layers[0].top
    oldyPos = doc.yPos
    doc.yPos = this.navObj.document.layers[0].top
    this.navObj.clip.height = doc.yPos
    ht = 0
    for (i=0 ; i < this.nC; i++) {
      if (!noDocs || this.c[i].isFolder) {
        if (this.c[i].hidden == false) this.c[i].initLayer()
      }
    }
    if (this.isOpen) {
      doc.yPos = oldyPos + ht
      this.navObj.clip.height += ht
      this.navObj.clip.width = Math.max(width, this.navObj.clip.width)
    }
    else doc.yPos = oldyPos
  }
  else doc.yPos += this.navObj.clip.height
}

function NewFolder(d, h, t, pid){
  folder = new Entry(d, h, t, pid)
  folder.isFolder = true
  return folder
}

function NewLink(d, h, t, pid){
  linkItem = new Entry(d, h, t, pid)
  linkItem.isFolder = false
  return linkItem
}

function insertFolder(p, c){
  return p.addChild(c)
}

function insertEntry(p, d){
  return p.addChild(d)
}

function addChild(childentry){
  this.c[this.nC] = childentry
  this.nC++
  return childentry
}

function fTimage(f){
  this.src = imageFolder + f
  return
}

function AddIcon(icon,prop,f) {
  icon[prop] = new Image()
  icon[prop].src = imageFolder + f
}

function initImage(){
  AddIcon(iNA,"au",auIcon)
  AddIcon(iNA,"chap",chapIcon)
  AddIcon(iNA,"page",pageIcon)
  AddIcon(iNA,"ques",questIcon)
  AddIcon(iNA,"test",testIcon)
  AddIcon(iNA,"sect",sectIcon)
  AddIcon(iNA,"testsect",testsectIcon)
  AddIcon(iNA,"surv",survIcon)
  AddIcon(iTA,"mn",mnIcon)
  AddIcon(iTA,"pn",pnIcon)
  AddIcon(iTA,"pln",plnIcon)
  AddIcon(iTA,"mln",mlnIcon)
  AddIcon(iTA,"pfn",pfnIcon)
  AddIcon(iTA,"mfn",mfnIcon)
  AddIcon(iTA,"b",bIcon)
  AddIcon(iTA,"ln",lnIcon)
  AddIcon(iTA,"fn",fnIcon)
  AddIcon(iTA,"vl",vlIcon)
  AddIcon(iTA,"n",nIcon)
  if( scrollWnd.arrStatusImages )
  {
	  if( scrollWnd.arrStatusImages[0] != '' )
	  {
		AddIcon(iPA,"$0",scrollWnd.arrStatusImages[0]);
		iPA['$0'].style.visibility = "inherit"
	  }
	  else
	  {
		AddIcon(iPA,"$0",scrollWnd.arrStatusImages[2]);
		iPA['$0'].style.visibility = "hidden"
	  }
	  
	  if( scrollWnd.arrStatusImages[1] != '' )
	  {
	    AddIcon(iPA,"$1",scrollWnd.arrStatusImages[1]);
		iPA['$1'].style.visibility = "inherit"
	  }
	  else
	  {
		AddIcon(iPA,"$1",scrollWnd.arrStatusImages[2]);
		iPA['$1'].style.visibility = "hidden"
	  }
		
	  AddIcon(iPA,"$2",scrollWnd.arrStatusImages[2]);
	  iPA['$2'].style.visibility = "inherit"
  }
}

backButton = false

function rewritepage() {
  if (backButton ) {
    history.back();
    setTimeout("history.back()",200);
    backButton = false
    return false;
  }
  backButton = true
  if (rewriting) return false;
  rewriting = true
  if (!fT) {
    alert("No TOC structure")
    rewriting = false
    return false;
  }
  if (noFrame) {
    doc = document
    frameParent = "window"
    thisFrame = self
  }
  else {
    thisFrame = this
    doc = thisFrame.document
    if (is.ns4) {
      if (doc.width == 0) {
        clearTimeout(rewriteID)
        rewriteID = setTimeout("rewritepage()",1000)
        rewriting = false
        return false;
      }
    }
  }
  if( is.ns5 ) doc.all = doc.getElementsByTagName("*");
  
  if( is.ieMac ) initialMode=2
  initImage()
  doc.open()
  nEntries = 0
  doc = thisFrame.document
  doc.write("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">" )
  doc.write("<html><head>")
  if (cssFile != "") doc.write("<link rel='stylesheet' href='" + cssFile + "' />")
  doc.write("<base href='" + document.location + "' />");
  doc.write("<title></title></head>")
  doc.write("<body>")
  doc.write("<table border='0' style='height:100%;width:100%;background-color:inherit;'><tr><td width='1' valign='top'>")
  doc.write("<div id='foldertree' style='position:static; '>")
  strbufarray = new Array
  ancStart = "<a "
  initializeDocument()
  eval("htmlStr = strbufarray.join(''); doc.write(htmlStr);")
  doc.write("</div>")
  doc.write("</td></tr></table>\n")
  doc.write("</body></html>\n")
  doc.body.topMargin = 0
  doc.body.leftMargin = 0
  doc.body.rightMargin = 0
  // Reset
  rewriting = false
  needRewrite = false
  needReload = false
  if( scrollWnd != null ) 
  {
    if( topLayer ) 
		scrollWnd.activate(topLayer.clip.width, topLayer.clip.height+gap, false)
    else 
		scrollWnd.activate(null,null,false)
    
	scrollWnd.bIsReady = 1;
  }
  
  return false;
}

function locateHrefNode( tocObj, child, targHref ) {
  var i
  
  if( !child )
    return null
    
  for( i = 0; i < child.nC; i++ ) {
    if( child.c[i].isFolder ) 
    { 
      var found = locateHrefNode( tocObj, child.c[i], targHref )
      if( found != null ) {
        tocObj.foldersToOpen[tocObj.numFTO] = child.c[i]
        tocObj.numFTO++
        return found;
      }
      else if ( child.c[i].href.indexOf( targHref ) >= 0 )
        return child.c[i]; 
    }
    else if ( child.c[i].href.indexOf( targHref ) >= 0 )
      return child.c[i]; 
  }
  
  return null;
}

function locateNode( tocObj, targHref, pageTracking ) {

    if (pageTracking)
    {
        var stack = new Array();
        stack.push(tocObj.foldertree);
        while (stack.length > 0)
        {
            var entry = stack[0];
            stack.splice(0, 1);
            if (entry)
            {
                var imgElem = null;
                if (entry.plateId != -1)
                {
                    if (!tocObj.tocFrame)
                        imgElem = entry.getDoc().getElementById('TOCPTIND' + entry.plateId);
                    else
                        imgElem = tocObj.tocFrame.document.getElementById('TOCPTIND' + entry.plateId);

                    var ptStatus = 0; // not started
                    ptStatus = pageTracking.GetRangeStatus(entry.plateId);
                    ptStatus = ptStatus == "complete" ? 2 : (ptStatus == "inprogress" ? 1 : 0);
                    entry.ptstat = ptStatus;
                    if (imgElem)
                    {
                        imgElem.src = entry.getStatusImage(entry.ptstat);
                        imgElem.style.visibility = entry.getStatusVisibility(entry.ptstat);
                    }

                    // navMode - 1=free, 2=restricted, 3=locked
                    if (tocObj.navMode == 3 || (ptStatus == 0 && tocObj.navMode == 2))
                        triv$(imgElem).closest("table").find("a").attr("href", "javascript:void(0);").css('cursor', 'default');

                }
                for (var i in entry.c)
                    if (entry.c[i]) stack.push(entry.c[i]);
            }
        }
    }
  
  if( tocObj.selNode )
  {
      tocObj.selNode.display()
      if( tocObj.selNode.navObj.style )
        tocObj.selNode.navObj.style.backgroundColor = ''
  }
  if(!tocObj.foldertree)
	 tocObj.foldertree = tocObj.div["foldertree"];

  tocObj.selNode = locateHrefNode( tocObj, tocObj.foldertree, targHref )

  while( tocObj.numFTO > 0 )
  {
    tocObj.numFTO--;
    if( !tocObj.foldersToOpen[tocObj.numFTO].isOpen )
      tocObj.foldersToOpen[tocObj.numFTO].clickOn( tocObj.foldersToOpen[tocObj.numFTO].id )
  }
  
  if( tocObj.selNode )
  {
      tocObj.selNode.display()
      if( tocObj.selNode.navObj.style )
        tocObj.selNode.navObj.style.backgroundColor = '#ece9d8'

      if( tocObj.useIFrame && tocObj.objLyr )
      {
        var temp = tocObj.selNode.navObj.offsetTop + 2 * tocObj.selNode.navObj.offsetHeight;
        if( (temp > tocObj.h) && !isSinglePagePlayerAvail())
          tocObj.objLyr.frame[0].scrollTo( 0, temp - tocObj.h )
      }
      else if( tocObj.window )
      {
        var temp = tocObj.selNode.navObj.top + 2 * tocObj.selNode.navObj.clip.height;
        if( temp > tocObj.h )
          tocObj.window.jumpTo( null, temp - tocObj.h )
      }
  }  
  
  if( tocObj.tocFrame &&  tocObj.tocFrame.document && tocObj.tocFrame.document.body && tocObj.tocFrame.document.body.innerHTML ) 
    getDisplayDocument().all[tocObj.name+'Content'].innerHTML=tocObj.tocFrame.document.body.innerHTML

    // LD-7990 handle no page tracking and nav mode = locked
    if (!pageTracking && tocObj.navMode == 3)
    {
        // This handles the mode with no iframe
        triv$('a', tocObj.div).attr("href", "javascript:void(0);").css('cursor', 'default');

        // This is for the mode with iframe
        triv$('a', tocObj.foldertree.getDoc()).attr("href", "javascript:void(0);").css('cursor', 'default');
	}
}

function ObjEntryRefresh(){
	
}

function ObjEntryRV(){
	this.refresh();
	if(this.objLyr && this.objLyr.ele)
	{
		for(var index = 0; index < this.objLyr.ele.style.length;index++)
		{
			var styleName = this.objLyr.ele.style[index];
			this.objLyr.ele.style[styleName]="";
		}
	}
}

// Global variables
// ****************
var indexOfEntries = new Array
var nEntries = 0
var needRewrite = true
var needReload = false
var doc = document
var topLayer = null
var firstInitial = true
try{
top.defaultStatus = "";
}catch(e){ if(e&&e.message)console.log( e.message ); }
iNA = new Object()
iTA = new Object()
iPA = new Object()
imageArray = new Object()
var nImageArray = 0
rewriteID = 0
rewriting = false
frameParent = "parent"
thisFrame = self
pnIcon = "ftpn.gif";
mnIcon = "ftmn.gif";
pfnIcon = "ftpfn.gif";
mfnIcon = "ftmfn.gif";
plnIcon = "ftpln.gif";
mlnIcon = "ftmln.gif";
nIcon = "ftn.gif";
fnIcon = "ftfn.gif";
lnIcon = "ftln.gif";
bIcon = "ftb.gif";
vlIcon = "ftvl.gif";
pageIcon = "tocpageicon.gif"
questIcon = "tocquesicon.gif"
chapIcon = "tocchapicon.gif"
auIcon   = "tocauicon.gif"
testIcon = "toctesticon.gif"
sectIcon = "tocsecticon.gif"
testsectIcon = "toctestsecticon.gif"
survIcon = "tocsurveyicon.gif"
var fT = 0

var cssFile = "trivantis.css"
var noFrame = true
var menuFrame = "menufrm"
var targetFrameParm = ""
var ancStart = "<a "
//var defFrame = 1
var gap = 8
var modalClick = false
var initialMode = 1
var treeLines = 1
var noDocs = false
var noTopFolder = true
var imageFolder = "images/"
var showIcons = true
var scrollWnd = null

function ObjInlineTOC(name,x,y,width,height,visible,zorder,bgcolor,frame,cl) {
  this.name=name
  this.x=x
  this.origX = x
  this.y=y
  this.w=width
  this.h=height
  this.oh = this.h;
  this.ow = this.w;
  this.frame=(frame!=null&&window.myTop)? window.myTop.frames[frame] : parent
  if( this.frame == null ) this.frame = parent
  this.v = visible
  this.bgColor=bgcolor
  this.z = zorder
  this.obj=this.name+"Object"
  this.foldertree=null
  this.foldersToOpen = new Array
  this.numFTO = 0
  this.selNode = null
  this.tocFrame=null
  this.alreadyActioned = false;
  eval(this.obj+"=this")
  this.addClasses = cl;
  this.bIsReady = 0;
  this.bFixedPosition = false;
  this.bInherited = false;
}

{ //Setup prototypes
var p=ObjInlineTOC.prototype
p.build=ObjInlineTOCBuild
p.init = ObjInlineTOCInit
p.activate=ObjInlineTOCActivate
p.load=ObjInlineTOCLoad
p.actionGoTo = ObjInlineTOCActionNULL
p.actionGoToNewWindow = ObjInlineTOCActionNULL
p.actionPlay = ObjInlineTOCActionNULL
p.actionStop = ObjInlineTOCActionNULL
p.actionShow = ObjInlineTOCActionShow
p.actionHide = ObjInlineTOCActionHide
p.actionLaunch = ObjInlineTOCActionNULL
p.actionExit = ObjInlineTOCActionNULL
p.actionChangeContents = ObjInlineTOCActionNULL
p.actionTogglePlay = ObjInlineTOCActionNULL
p.actionToggleShow = ObjInlineTOCActionToggleShow
p.onShow = ObjInlineTOCOnShow
p.onHide = ObjInlineTOCOnHide
p.isVisible = ObjInlineTOCIsVisible
p.sizeTo = ObjInlineSizeTo
p.loadProps = ObjLoadProps
p.respChanges = ObjRespChanges
p.refresh = ObjInlineTOCRefresh
p.getCSS = ObjInlineTOCGetCSS
p.rv = ObjInlineTOCRV
}

function ObjInlineTOCBuild() {
	this.loadProps();

	this.css = this.getCSS();
	this.bInherited = checkObjectInheritance(this);

	if(this.bInherited)
		return;

	this.divFrame='<iframe name="'+this.name+'Frame" width=0 height=0 style="position:absolute; left:0; top:0; visibility:none; display:none;"></iframe>\n'
	this.divStart='<div id="'+this.name+'"'
	if( this.addClasses ) this.divStart += ' class="'+this.addClasses+'"'
	this.divStart+='><div id="'+this.name+'Content" style="top:0px; left:0px; width:100%; height:100%; background-color:'+this.bgColor+';">'
	this.divEnd='</div></div>'
	this.div=this.divStart+this.divEnd

	this.divFrame = CreateHTMLElementFromString(this.divFrame);
	this.div = CreateHTMLElementFromString(this.div);
}

function ObjInlineTOCInit() {
  this.objLyr = new ObjLayer(this.name, null, null, this.div)
  appendElement(null, null, this.divFrame);
  adjustForFixedPositon(this);
}

function ObjInlineTOCActivate(w,h) {
  
	if( is.ns5 ) getDisplayDocument().all = getDisplayDocument().getElementsByTagName("*");
	if( !this.tocFrame ) return;
	if(!this.bInherited)
	{
	  if( this.tocFrame.document.body.innerHTML ) 
		getDisplayDocument().all[this.name+'Content'].innerHTML=this.tocFrame.document.body.innerHTML;
	}

	this.contentlyr=new ObjLayer(this.name+'Content')
	this.contentlyr.show()
	this.contentHeight=h
	this.contentWidth=w
	this.objLyr.clipTo(0,getDisplayDocument().all[this.name+'Content'].scrollWidth,getDisplayDocument().all[this.name+'Content'].scrollHeight,0)
	if( is.ieMac ) {
		this.objLyr.ele.offsetHeight = this.contentlyr.ele.offsetHeight
		this.objLyr.ele.offsetWidth = this.contentlyr.ele.offsetWidth
	}
	this.activated=true
	if( this.v ) this.actionShow()
	  
	this.objLyr.theObj = this;
	
	this.objLyr.updateTabIndex(this.objLyr);
}

function locateFrame( frameName, currFrame ) {
  var frame = false; 
  try{
    if( currFrame[frameName] )
    {
      if( currFrame[frameName].frameElement)
      {
        if( currFrame[frameName].frameElement.parentElement == GetCurrentPageDiv())
          frame = currFrame[frameName];
        else
          return null; 
      }
      else
      {
        if(GetCurrentPageDiv().children[frameName])
          frame =  GetCurrentPageDiv().children[frameName].contentWindow;
      }
    }
  }
  catch(e){}

  if (frame) return frame;
  else  
  {
      var index = 0
      while( index < currFrame.length ) {
        var testFrame = locateFrame( frameName, currFrame[index] )
        if( testFrame ) return testFrame
        index++
      }
  }
}

function ObjInlineTOCLoad(url) {
  var THIS = this;
  if( !THIS.activated ) {
    THIS.url=url
    THIS.refresh=true
    var targFrameName = THIS.name+'Frame'
    var targFrame = locateFrame( targFrameName, THIS.frame.frames )

    if( targFrame ) {            
      THIS.tocFrame = targFrame
      THIS.tocFrame.document.location=THIS.url
    }
    else 
    {
      setTimeout( function () {THIS.load(url)}, 1000);
    }
  }
}

function ObjInlineTOCActionShow( ) {
  if( !this.isVisible() )
    this.onShow();
}

function ObjInlineTOCActionHide( ) {
  if( this.isVisible() )
    this.onHide();
}

function ObjInlineTOCActionToggleShow( ) {
  var THIS = this;
  if( !THIS.objLyr ) {
      if( !THIS.activated ) setTimeout( THIS.obj + ".actionToggleShow()", 1000 );
  }
  else {
    if(THIS.objLyr.isVisible() && !THIS.objLyr.bInTrans) THIS.actionHide();
    else THIS.actionShow();
  }
}

function ObjInlineTOCActionNULL( ) {
}

function ObjInlineTOCOnShow() {
  var THIS = this;
  THIS.alreadyActioned = true;
  if( !THIS.objLyr ) {
      if( !THIS.activated ) setTimeout( THIS.obj + ".actionShow()", 1000 );
  }
  else THIS.objLyr.actionShow();
}

function ObjInlineTOCOnHide() {
  var THIS = this;
  THIS.alreadyActioned = true;
  if( !THIS.objLyr ) {
    if( !THIS.activated ) setTimeout( THIS.obj + ".actionHide()", 1000 );
  }
  else THIS.objLyr.actionHide();
}

function ObjInlineTOCIsVisible() {
  if( this.objLyr.isVisible() )
    return true;
  else
    return false;
}

function ObjInlineSizeTo( w, h, bResp ) {
  this.w = w
  this.h = h
  if( this.objLyr  && typeof(bResp) == "undefined")
    this.objLyr.clipTo( 0, w, h, 0  )
}

function ObjLoadProps()
{
	if(is.jsonData != null)
	{
		var respValues = is.jsonData[is.clientProp.device];
		var newValues;
		newValues = respValues[is.clientProp.width];
		var obj = newValues[this.name];
		if(obj)
		{
			this.x = typeof(obj.x)!="undefined"?obj.x:this.x;
			this.origX = typeof(obj.x)!="undefined"?obj.x:this.x;
			this.y = typeof(obj.y)!="undefined"?obj.y:this.y;
			this.w = typeof(obj.w)!="undefined"?obj.w:this.w;
			this.h = typeof(obj.h)!="undefined"?obj.h:this.h;
            if( typeof(obj.fsize) != "undefined" )
                this.fsize = obj.fsize;
            if (typeof (obj.navMode) != "undefined")
                this.navMode = obj.navMode;
		}
	}
}

function ObjRespChanges()
{
	if(this.objLyr)
	{
        this.sizeTo(this.w, this.h, true);
	
        //Adjust the CSS written in the head
        FindAndModifyObjCSSBulk(this,this.stylemods);
        
        //Adjust the CSS written in the head of the iframe.
        var myFrame = getDisplayDocument().getElementsByName(this.name+'Frame');
        if( myFrame.length >= 0 )
        {
	    var styleTags = null;
	    try{
	        styleTags = myFrame[0].contentWindow.document.getElementsByTagName('head')[0].getElementsByTagName('style');
            }catch(e){
		if(e&&e.message)console.log(e.message);
	    }
	    for(var index = 0; styleTags && index < styleTags.length; index++)
            {
                var styTag = styleTags[index];
                if(styTag.innerHTML.indexOf(" a ") > -1)
                {
                    var styleTag = styTag;
                    if(styleTag)
                        ModifyCSSForResponsiveForIframe(styleTag, this, " a ");
                }
            }
        }
	}
}

function ModifyCSSForResponsiveForIframe(styleTag, thisObj, scopeName)
{
	var scopeNamePos = styleTag.innerHTML.indexOf(scopeName);
    while( scopeNamePos != -1 )
    {
        var startPos = -1;
        var endPos = -1;
        var bPrefix = false;
    
        startPos = styleTag.innerHTML.indexOf("{",scopeNamePos+scopeName.length)+1;
        endPos = styleTag.innerHTML.indexOf("}", startPos);
        if( endPos != -1 )
        {
            var originalStr = styleTag.innerHTML.substring(startPos, endPos);
            var tokenZ = originalStr.split(";");
            var newCSS = "";
            while (tokenZ.length)
            {
                var attrib = tokenZ.shift();
                if( attrib.trim().length > 0 )
                {
                    attrib = ApplyCSSResponsiveChanges(attrib, thisObj);
                    newCSS = newCSS + attrib;
                }
            }
            originalStr = scopeName.trim()+" {"+originalStr+"}";
            newCSS = scopeName.trim()+" {"+newCSS+"}";
            styleTag.innerHTML = styleTag.innerHTML.replace(originalStr, newCSS);
            
            scopeNamePos = styleTag.innerHTML.indexOf(scopeName, endPos+1);
        }
        else
            break;
    }
}

function ObjInlineTOCRefresh(){
	
}

function ObjInlineTOCGetCSS(){
	var css = '';
	
	css = buildCSS(this.name,this.bFixedPosition,this.x,this.y,this.w,this.h,this.v,this.z);
	
	return css;
}

function ObjInlineTOCRV(){
	this.loadProps();
	if(!window.bTrivResponsive)
	{
		this.h = this.oh;
		this.w = this.ow;
	}
	this.css = this.getCSS();
	this.refresh();
	if(this.objLyr && this.objLyr.ele)
	{
		for(var index = 0; index < this.objLyr.ele.style.length;index++)
		{
			var styleName = this.objLyr.ele.style[index];
			this.objLyr.ele.style[styleName]="";
		}
		if(!this.v)
			this.objLyr.ele.style.visibility = 'hidden';
	}
}

GHB = {
	Language: {},
	
	currentUser: "",
	currentRepository: null,
	currentBranch: null,
	currentDirectory: null,
	currentPath: "",
	
	showError: function (message){
		var dialogHtml="<div style='padding:15px; font-size: 16px;'>";
		if (message != null && message != ""){
			dialogHtml += GHB.Language["ghb.error.first"]+"<br/><b>"+message+"</b><br/><br/>";
		}
		dialogHtml += "<span style='text-align:justify;'>"+GHB.Language["ghb.error.general"]+"</span>";
		dialogHtml += "</div>";
		AUI().use('aui-dialog',function(A){
			new A.Dialog({
				 bodyContent: dialogHtml,
				 centered: true,
				 constrain2view: true,
				 destroyOnClose: true,
				 draggable: true,
				 height: 300,
				 resizable: false,
				 stack: true,
				 title: Liferay.Language.get("error"),
				 width: 460,
				 buttons: [
				           {
				        	   title: Liferay.Language.get("close"),
				        	   label:Liferay.Language.get("close"),
				        	   handler: function(){
				        		   this.close();
				        	   }
				        			   
				           }
				           ]
				 }).render();	
		});		
	},
	
	showUserInfo: function (userName) {
		var userObject = new Gh3.User(userName);
		userObject.fetch(function(e,r){
			if (e) {
				GHB.showError(e.message ? e.message : "");
				return false;
			}
			var dialogHtml = "<div id='GHB_userInfoDiv'><table><tr><td valign='top'><img src='"+r.avatar_url+"' style='width:80px;height:80px;'/></td>";
			dialogHtml += "<td valign='top' style='padding-left:10px;'><b>"+(!r.name ? r.login : (r.name+"&nbsp;("+r.login+")"))+"</b><br/><b>"+GHB.Language["ghb.user.type"]+"</b>&nbsp;"+r.type+"<br/><b>";
			dialogHtml += GHB.Language["ghb.created.at"]+"</b>&nbsp;"+r.created_at+"<br/><b>";
			dialogHtml += GHB.Language["ghb.last.commit"]+"</b>&nbsp;"+r.updated_at+"<br/><b>";
			dialogHtml += GHB.Language["ghb.repos.count"]+"</b>&nbsp;"+r.public_repos+"<br/>";
			if (r.blog && r.blog != null && r.blog != '') {
				dialogHtml += "<b>"+GHB.Language["ghb.user.blog"]+"</b>&nbsp;<a target='_blank' href='"+r.blog+"'>"+r.blog+"</a>";
			}
			dialogHtml +="</td></tr></table></div>";
			AUI().use('aui-dialog',function(A){
				new A.Dialog({
					 bodyContent: dialogHtml,
					 centered: true,
					 constrain2view: true,
					 destroyOnClose: true,
					 draggable: true,
					 height: 250,
					 resizable: false,
					 stack: true,
					 title: (!r.name ? r.login : (r.name+"("+r.login+")")),
					 width: 400,
					 buttons: [
					           {
					        	   title: Liferay.Language.get("close"),
					        	   label:Liferay.Language.get("close"),
					        	   handler: function(){
					        		   this.close();
					        	   }
					        			   
					           }
					           ]
					 }).render();	
			});	
		});
	},
	
	showNavigator: function (path) {
		var navString = "<span class='GHB_navLink' id='GHB_userLink'>"+GHB.currentUser+"</span>&nbsp;";
		if (GHB.currentRepository != null) {
			navString += "<b>/</b>&nbsp;<span class='GHB_navLink' id='GHB_repoLink'>"+GHB.currentRepository.name+"</span>&nbsp;";
		}
		if (path != "") {
			var pathArray = path.split("/");
			for (var i in pathArray) {
				var pathAttr = "";
				for (var k=0; k<=i; k++) {
					pathAttr += (k>0 ? "/" : "")+pathArray[k];
				}
				navString +="<b>/</b>&nbsp;<span class='GHB_navLink GHB_dirLink' path='"+pathAttr+"'>"+pathArray[i]+"</span>&nbsp;";
			}
		}
		jQuery("#GHB_navigatorLine").html(navString);
		jQuery("#GHB_userLink").click(function(){
			GHB.showRepositories(GHB.currentUser);
		});
		if (GHB.currentRepository != null) {
			jQuery("#GHB_repoLink").click(function(){
				GHB.openRepository(GHB.currentRepository);
			});
		}
		if (path != "") {
			jQuery(".GHB_dirLink").click(function(){
				var path = jQuery(this).attr("path");
				GHB.openDirectoryByPath(path,true);
			});
		}
		GHB.currentPath = path;
		jQuery("#GHB_navigatorLine").css("visibility","visible");
	},
	
	showRepositories: function (userName) {
		GHB.currentUser = userName;
		GHB.currentRepository = null;
		GHB.currentBranch = null;
		jQuery("#GHB_navigatorLine").css("visibility","hidden");
		GHB.showNavigator("");
		var repoDetails = jQuery("#GHB_repoDetailsTd");
		repoDetails.css({"text-align":"center","font-style":"italic"});
		repoDetails.attr("valign","middle");
		repoDetails.html(GHB.Language["ghb.select.repo"]);
		if (!userName || userName == "") {
			GHB.showError(GHB.Language["ghb.username.undefined"]);
			return false;
		}
		var userObject = new Gh3.User(userName);
		var userRepos = new Gh3.Repositories(userObject);
		
		var tableDiv = jQuery("#GHB_viewportTable");
		userRepos.fetch({},"",function(e,b){
			if (e) {
				GHB.showError(e.message ? e.message : "");
				return false;
			}
			if (userRepos.getRepositories().length > 0) {
				var htmlText = "<div class='GHB_onTop'><span class='GHB_headerSpan'>&nbsp;"+GHB.Language["ghb.select.repos"]+"</span></div><table border='1'>";
				for (var k=0; k<userRepos.getRepositories().length; k++){
					var repo = userRepos.getRepositories()[k];
					var tdClass = (k % 2 == 0) ? "GHB_reposTableEvenRow" : "GHB_reposTableOddRow";
					htmlText += "<tr><td class='"+tdClass+" GHB_reposTableRow'>"+repo.name+"</td></tr>";
				}
				htmlText += "</table>";
				tableDiv.html(htmlText);
				tableDiv.css("display","");
				jQuery(".GHB_reposTableRow").click(function(){
					jQuery(".GHB_reposTableRow").removeClass("GHB_selectedRepo");
					jQuery(this).addClass("GHB_selectedRepo");
					GHB.repositoryInfo(getRepository(userRepos.getRepositories(),jQuery(this).text()));
				});
				jQuery(".GHB_reposTableRow").dblclick(function(){
					jQuery(".GHB_reposTableRow").removeClass("GHB_selectedRepo");
					jQuery(this).addClass("GHB_selectedRepo");
					GHB.openRepository(getRepository(userRepos.getRepositories(),jQuery(this).text()));
				});
				repoDetails.css("display","");
			} else {
				alert(GHB.Language["ghb.repos.not.found"]+userName+"!");
				tableDiv.html("");
			}
		});
	},
	
	repositoryInfo: function (repo) {
		var repoDetails = jQuery("#GHB_repoDetailsTd");
		var htmlText = "<div class='GHB_repoInfoDiv'>";
		htmlText += "<span class='bold'>"+GHB.Language["ghb.repo.full.name"]+"</span>&nbsp;";
		htmlText += repo.full_name;
		htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.repo.language"]+"</span>&nbsp;";
		htmlText += repo.language;	
		htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.repo.last.update"]+"</span>&nbsp;";
		htmlText += repo.updated_at;	
		htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.repo.description"]+"</span>&nbsp;";
		htmlText += repo.description;	
		htmlText += "</div>";
		htmlText += "<button id='GHB_openRepoButton'>"+GHB.Language["ghb.open.repo.btn"]+"</button>";
		repoDetails.css({"text-align":"left","font-style":"normal"});
		repoDetails.attr("valign","top");
		repoDetails.html(htmlText);
		jQuery("#GHB_openRepoButton").click(function(){
			GHB.openRepository(repo);
		});
	},
	
	openFile: function(fileObject) {
		GHB.toggleLoading();
		fileObject.fetchContent(function(e,r){
			if (e) {
				GHB.showError(e.message ? e.message : "");
				return false;
			}
			var dialogHtml = "<pre id='GHB_fileContent'>";
			dialogHtml += "</pre>";
			AUI().use('aui-dialog',function(A){
				new A.Dialog({
					 bodyContent: dialogHtml,
					 centered: true,
					 constrain2view: true,
					 destroyOnClose: true,
					 draggable: true,
					 height: 480,
					 resizable: false,
					 stack: true,
					 title: fileObject.path,
					 width: 640,
					 buttons: [
					           {
					        	   title: Liferay.Language.get("close"),
					        	   label:Liferay.Language.get("close"),
					        	   handler: function(){
					        		   this.close();
					        	   }
					        			   
					           }
					           ]
					 }).render();	
				jQuery("#GHB_fileContent").text(fileObject.getRawContent());
				GHB.toggleLoading();
			});
			
			
		});
	},
	
	openFileByPath: function(path){
		var fileName = path.substring(path.lastIndexOf("/")+1);
		var fileObject = GHB.currentDirectroy.getFileByName(fileName);
		GHB.openFile(fileObject);
	},
	
	openDirectoryByPath: function(path, fromBranch){
		if (!fromBranch) {
			var dirObject = GHB.currentDirectory.getDirByName(path);
			GHB.openDirectory(dirObject, path);				
		} else {
			var pathArray = path.split("/");
			var rootObject = GHB.currentBranch.getDirByName(pathArray[0]);
			var pathName = pathArray[0];
			if (pathArray.length>1){
				for (var k=1;k<pathArray.length;k++){
					rootObject = rootObject.getDirByName(pathArray[k]);
					pathName = rootObject.name;
				}
			}
			GHB.openDirectory(rootObject,pathName);
		}
		
	},
	
	openDirectory: function(dirObject, pathName) {
		var repoDetails = jQuery("#GHB_repoDetailsTd");
		var tableDiv = jQuery("#GHB_viewportTable");
		repoDetails.css("display","none");
		GHB.toggleLoading();
		var htmlText = "<div class='GHB_onTop'><span class='GHB_headerSpan'>&nbsp;"+(!pathName || pathName=="" ? dirObject.name : pathName)+"</span></div><table border='1'>";
		dirObject.fetchContents(function (e,r){
			if (e) {
				GHB.showError(e.message ? e.message : "");
				return false;
			}
			dirObject.sortContents(function(a,b){
				if (a.type == b.type) {
					return 0;
				}
				else if (a.type != b.type && a.type=="dir") {
					return -1;
				}
				else if (a.type != b.type && b.type=="dir") {
					return 1;
				}
			});
			htmlText += "<tr><td class='GHB_reposTableOddRow' style='text-align:center;border:none !important;'>"+
				"<span id='GHB_backLink'>"+GHB.Language["ghb.back.link"]+"&nbsp;(..)</span>"
				+"</td><tr>";
			for (var k=0; k<dirObject.getContents().length; k++){
				var element = dirObject.getContents()[k];
				var tdClass = (k % 2 == 0) ? "GHB_reposTableEvenRow" : "GHB_reposTableOddRow";
				var elementType = "<span class='bold' style='font-family: monospace;'>"+(element.type == "file" ? "[F]" : "[D]")+"</span>";
				htmlText += "<tr><td class='"+tdClass+" GHB_reposTableRow' type='"+element.type+"' path='"+element.name+"'>"+elementType + 
					"&nbsp;&nbsp;<span class='GHB_filePath' type='"+element.type+"'>" + 
					element.name+"</span></td></tr>";
			}		
			htmlText += "</table>";
			repoDetails.css({"text-align":"center","font-style":"italic","display":""});
			repoDetails.attr("valign","middle");
			repoDetails.html(GHB.Language["ghb.select.file"]);	
			tableDiv.html(htmlText);
			GHB.showNavigator(dirObject.path);
			jQuery("#GHB_backLink").click(function(){
				if (dirObject.path.lastIndexOf("/")==-1) {
					GHB.openRepository(GHB.currentRepository,GHB.currentBranch.name);
				} else {
					GHB.openDirectoryByPath(dirObject.path.substring(0,dirObject.path.lastIndexOf("/")),true);
				}
				
			});
			GHB.currentDirectory = dirObject;
			jQuery(".GHB_reposTableRow").click(function(){
				jQuery(".GHB_reposTableRow").removeClass("GHB_selectedRepo");
				jQuery(this).addClass("GHB_selectedRepo");
				GHB.elementInfo(GHB.currentDirectory,jQuery(this).children(".GHB_filePath").attr("type"),jQuery(this).children(".GHB_filePath").text());
			});
			jQuery(".GHB_reposTableRow").dblclick(function(){
				if (jQuery(this).attr("type")=="file") {
					GHB.openFile(dirObject.getFileByName(jQuery(this).children(".GHB_filePath").text()));
				} else {
					GHB.openDirectoryByPath(jQuery(this).attr("path"),false);
				}
			});
			GHB.toggleLoading();
		});
		
	},
	
	elementInfo: function(branch, type, fileName){
		var repoDetails = jQuery("#GHB_repoDetailsTd");
		var htmlText = "<div class='GHB_repoInfoDiv'>";
		if (type == "file") {
			var fileObject = branch.getFileByName(fileName);
			fileObject.fetchCommits(function(e,r){
				if (e) {
					GHB.showError(e.message ? e.message : "");
					return false;
				}
				htmlText += "<span class='bold'>"+GHB.Language["ghb.repo.full.name"]+"</span>&nbsp;";
				htmlText += fileObject.name;
				htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.file.size"]+"</span>&nbsp;";
				htmlText += fileObject.size + "&nbsp;"+GHB.Language["ghb.bytes"];	
				htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.file.checksum"]+"</span>&nbsp;";
				htmlText += fileObject.sha;	
				htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.last.commit"]+"</span>&nbsp;";
				htmlText += fileObject.getLastCommit().date+" (<a href='mailto:"+fileObject.getLastCommit().author.email + 
					"'>"+fileObject.getLastCommit().author.name+"</a>)";
				htmlText += "</div>";
				htmlText += "<button id='GHB_openElementButton'>"+(type=="file" ? GHB.Language["ghb.open.file.btn"] : GHB.Language["ghb.open.dir.btn"])+"</button>";
				repoDetails.css({"text-align":"left","font-style":"normal"});
				repoDetails.attr("valign","top");
				repoDetails.html(htmlText);
				jQuery("#GHB_openElementButton").click(function(){
					GHB.openFile(fileObject);
				});		
			});
		} else {
			var dirObject = branch.getDirByName(fileName);

			htmlText += "<span class='bold'>"+GHB.Language["ghb.repo.full.name"]+"</span>&nbsp;";
			htmlText += dirObject.name;
			htmlText += "<br/><span class='bold'>"+GHB.Language["ghb.file.checksum"]+"</span>&nbsp;";
			htmlText += dirObject.sha;	
			htmlText += "</div>";
			htmlText += "<button id='GHB_openElementButton'>"+(type=="file" ? GHB.Language["ghb.open.file.btn"] : GHB.Language["ghb.open.dir.btn"])+"</button>";
			repoDetails.css({"text-align":"left","font-style":"normal"});
			repoDetails.attr("valign","top");
			repoDetails.html(htmlText);
			jQuery("#GHB_openElementButton").click(function(){
				GHB.openDirectory(dirObject,"");
			});							
		}

	},
	
	toggleLoading: function(){
		if (jQuery("#GHB_loadingScreen").css("display")=="none"){
			jQuery("#GHB_loadingScreen").css("display","");
		} else {
			jQuery("#GHB_loadingScreen").css("display","none");
		}
	},
	
	openRepository: function (repo,branchName) {
		GHB.currentRepository = repo;
		GHB.showNavigator("");
		if (!branchName) {
			branchName = repo.master_branch;
		}
		var repoDetails = jQuery("#GHB_repoDetailsTd");
		var tableDiv = jQuery("#GHB_viewportTable");
		repoDetails.css("display","none");
		GHB.toggleLoading();
		repo.fetch(function(e,r){
			if (e) {
				GHB.showError(e.message ? e.message : "");
				return false;
			}
			repo.fetchBranches(function (e,r) {
				if (e) {
					GHB.showError(e.message ? e.message : "");
					return false;
				}
				var branch = repo.getBranchByName(branchName);
				branch.fetchContents(function(e,r){
					if (e) {
						GHB.showError(e.message ? e.message : "");
						return false;
					}
					var htmlText = "<div class='GHB_onTop'><span class='GHB_headerSpan'>&nbsp;"+repo.full_name+"</span></div><table border='1'>";
					if (branch.getContents().length>0) {
						branch.sortContents(function(a,b){
							if (a.type == b.type) {
								return 0;
							}
							else if (a.type != b.type && a.type=="dir") {
								return -1;
							}
							else if (a.type != b.type && b.type=="dir") {
								return 1;
							}
						});
						htmlText += "<tr><td class='GHB_reposTableOddRow' style='text-align:center;border:none !important;'>"+
							"<span id='GHB_backLink'>"+GHB.Language["ghb.back.link"]+"&nbsp;(..)</span>"
							+"</td><tr>";
						for (var k=0; k<branch.getContents().length; k++){
							var element = branch.getContents()[k];
							var tdClass = (k % 2 == 0) ? "GHB_reposTableEvenRow" : "GHB_reposTableOddRow";
							var elementType = "<span class='bold' style='font-family: monospace;'>"+(element.type == "file" ? "[F]" : "[D]")+"</span>";
							htmlText += "<tr><td class='"+tdClass+" GHB_reposTableRow' type='"+element.type+"' path='"+element.path+"'>"+elementType + 
							"&nbsp;&nbsp;<span class='GHB_filePath' type='"+element.type+"'>" + 
							element.name+"</span></td></tr>";
						}
						htmlText += "</table>";
						repoDetails.css({"text-align":"center","font-style":"italic","display":""});
						repoDetails.attr("valign","middle");
						repoDetails.html(GHB.Language["ghb.select.file"]);
					} else {
						htmlText += "<br/><div style='text-align:center;font-style:italic;font-size:14px;'>"+GHB.Language["ghb.empty.repo"]+"</div>";
					}
					tableDiv.html(htmlText);
					GHB.currentDirectory = branch;
					jQuery("#GHB_backLink").click(function(){
						GHB.showRepositories(GHB.currentUser);
					});
					jQuery(".GHB_reposTableRow").click(function(){
						jQuery(".GHB_reposTableRow").removeClass("GHB_selectedRepo");
						jQuery(this).addClass("GHB_selectedRepo");
						GHB.elementInfo(branch,jQuery(this).children(".GHB_filePath").attr("type"),jQuery(this).children(".GHB_filePath").text());
					});
					jQuery(".GHB_reposTableRow").dblclick(function(){
						if (jQuery(this).attr("type")=="file") {
							GHB.openFile(branch.getFileByName(jQuery(this).children(".GHB_filePath").text()));
						} else {
							GHB.openDirectory(branch.getDirByName(jQuery(this).attr("path")));
						}
					});
					GHB.toggleLoading();
					GHB.currentBranch = branch;
				});
				
			});
		});
	}
};

getRepository = function(array,repoName){
	for (var n in array) {
		if (array[n].name == repoName)
			return array[n];
	}
	return null;
};

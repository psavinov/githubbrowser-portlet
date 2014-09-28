
<%
	/**
 * Copyright (c) 2000-2012 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */
%>

<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet"%>
<%@ include file="init.jsp"%>
<%@ page import="com.liferay.portal.kernel.util.ParamUtil" %>
<%@ page import="com.liferay.portal.kernel.util.Validator" %>
<%@ page import="com.liferay.portlet.PortletPreferencesFactoryUtil" %>
<%@ page import="javax.portlet.PortletPreferences" %>

<portlet:defineObjects />
<%
	PortletPreferences preferences = renderRequest.getPreferences();
	
	String portletResource = ParamUtil.getString(request, "portletResource");
	
	if (Validator.isNotNull(portletResource)) {
		preferences = PortletPreferencesFactoryUtil.getPortletSetup(request, portletResource);
	}

	String defaultUser = preferences.getValue("ghb-default-user","liferay");
%>
<%
	Locale loc = renderRequest.getLocale();
	 ResourceBundle res = ResourceBundle.getBundle("/ru/psavinov/liferay/ghb/GHBPortlet", loc);
	 for (String key : res.keySet()) {
%>
<script>
		 	GHB.Language["<%=key%>"] = '<%=res.getString(key)%>';
</script>
<%
	}
%>
<body onload="">
	<script>
		jQuery(document).ready(function() {
			jQuery(".GHB_userNameInput input").keyup(function(e) {
				if (e.keyCode == 13) {
					GHB.showRepositories($('.GHB_userNameInput input').val())
				}
			});
			
			GHB.showRepositories(jQuery('.GHB_userNameInput input').val());
		});
	</script>
	<div id="GHB_mainDiv">
		<div>
			<table>
				<tr>
					<td style="padding-right: 10px;"><span
						class="GHB_usernameLabel"><%=res.getString("ghb.username")%></span>
					</td>
					<td style="padding-right: 10px;"><aui:input
							name="GHB_userName" cssClass="GHB_input GHB_userNameInput"
							label="" value="<%=defaultUser%>">
						</aui:input></td>
					<td style="padding-right: 5px;"><aui:button
							name="GHB_loadButton"
							value='<%=res.getString("ghb.show.repos")%>'
							onclick="GHB.showRepositories($('.GHB_userNameInput input').val())" />
					</td>
					<td><aui:button name="GHB_loadButton"
							value='<%=res.getString("ghb.show.user.info")%>'
							onclick="GHB.showUserInfo($('.GHB_userNameInput input').val())" />
					</td>
				</tr>
			</table>
			<hr />
			<div id="GHB_navigatorLine" style="visibility: hidden; height: 20px;"></div>
			<div id="GHB_viewportDiv" style="position: relative;">
				<div id="GHB_viewportRepos">
					<div id="GHB_loadingScreen"
						style="display: none; position: absolute; z-index: 10; left: 0; top: 0; width: 400px; height:300px; border-radius:5px; border:1px solid white; text-align: center; background: white; opacity: 0.6;">
						<div style="height:120px;">&nbsp;</div><span style='font-size: 18px;margin-top:130px;'><%=res.getString("ghb.loading")%></span>
					</div>
					<table>
						<tr>
							<td><div id="GHB_viewportTable" class="GHB_reposTable"
									style="display: none;"></div></td>
							<td id="GHB_repoDetailsTd"
								style="padding: 20px; text-align: center; font-size: 16px; font-style: italic; display: none;"><span><%=res.getString("ghb.select.repo")%></span></td>
						</tr>
					</table>

				</div>
			</div>
			<hr />
		</div>
	</div>
</body>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>
<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/portlet" prefix="liferay-portlet" %>

<%@ page import="com.liferay.portal.kernel.util.ParamUtil" %>
<%@ page import="com.liferay.portal.kernel.util.Validator" %>
<%@ page import="com.liferay.portlet.PortletPreferencesFactoryUtil" %>
<%@ page import="javax.portlet.PortletPreferences" %>
<%@ page import="javax.portlet.RenderRequest" %>


<portlet:defineObjects />
<%
	PortletPreferences preferences = renderRequest.getPreferences();
	
	String portletResource = ParamUtil.getString(request, "portletResource");
	
	if (Validator.isNotNull(portletResource)) {
		preferences = PortletPreferencesFactoryUtil.getPortletSetup(request, portletResource);
	}

	String defaultUser = preferences.getValue("ghb-default-user","liferay");
%>
<portlet:defineObjects />
<form action="<liferay-portlet:actionURL portletConfiguration="true" />"
	method="post" name="<portlet:namespace />fm">
	Default GitHub user:&nbsp;&nbsp;<input type="text" name="GHB_defaultUsername" value='<%=defaultUser%>'>

	<input type="button" value="Save" onClick="submitForm(document.<portlet:namespace />fm);" />
	<br/><br/>
</form>

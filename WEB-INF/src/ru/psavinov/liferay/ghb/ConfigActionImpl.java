package ru.psavinov.liferay.ghb;

import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.PortletConfig;
import javax.portlet.PortletPreferences;
import javax.portlet.RenderRequest;
import javax.portlet.RenderResponse;

import com.liferay.portal.kernel.portlet.ConfigurationAction;
import com.liferay.portal.kernel.servlet.SessionMessages;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portlet.PortletPreferencesFactoryUtil;

public class ConfigActionImpl implements ConfigurationAction {

	@Override
	public void processAction(PortletConfig arg0, ActionRequest arg1,
			ActionResponse arg2) throws Exception {
		String portletResource = ParamUtil.getString(arg1, "portletResource"); 

		  PortletPreferences prefs = PortletPreferencesFactoryUtil.getPortletSetup(arg1, portletResource); 
		  String newDefaultUser = (arg1.getParameter("GHB_defaultUsername") != null && !arg1.getParameter("GHB_defaultUsername").equals("")) ? 
				  arg1.getParameter("GHB_defaultUsername") : 
					  "liferay";
		  prefs.setValue("ghb-default-user", newDefaultUser);
		  prefs.store();
		  SessionMessages.add(arg1, arg0.getPortletName() + ".doConfigure");
	}

	@Override
	public String render(PortletConfig arg0, RenderRequest arg1,
			RenderResponse arg2) throws Exception {
		return "/configuration.jsp";
	}

}

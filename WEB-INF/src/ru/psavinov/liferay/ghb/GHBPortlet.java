package ru.psavinov.liferay.ghb;

import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.util.bridges.mvc.MVCPortlet;

public class GHBPortlet extends MVCPortlet {
	
	public static Log getLog() {
		return _log;
	}

	private static final Log _log = LogFactoryUtil.getLog(GHBPortlet.class); 

}

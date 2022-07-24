import {DefaultJitsuEvent} from "@jitsu/types/event";
import {DestinationFunction, DestinationMessage, JitsuDestinationContext} from "@jitsu/types/extension";
import {flatten, removeProps} from "@jitsu/pipeline-helpers";

export type PlausibleDestinationConfig = {
    anonymous?: boolean,
    plausible_domain: string,
    plausible_port: string
}

export const JitsuPlausible: DestinationFunction<DefaultJitsuEvent, PlausibleDestinationConfig> =  (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<PlausibleDestinationConfig>) => {
    const context = event.eventn_ctx || event;
    const user = context.user || {};
    const utm = context.utm || {};
    const location = context.location || {};
    const ua = context.parsed_ua || {};
    const conversion = context.conversion || {};

    const matches = context.referer?.match(
        /^http?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i
    );
    const refDomain = matches && matches[1]; // domain will be null if no match is found
    const config = dstContext.config

    function getEventType($) {
        switch ($.event_type) {
            case "pageview":
                return "pageview";
            //case "user_identify":
            //case "identify":
            //    return "$identify";
            //case "page":
            //case "site_page":
            //    return "site_page";
            default:
                return $.event_type;
        }
    }

    const eventType = getEventType(event);
    let envelops:DestinationMessage[] = [];

    if(config.anonymous){
      context.source_ip = "000.000.000.000"; // masl ip
      context.ids.ga = "undefined"; // mask ga
    }

    //on pageview
    if (eventType === "pageview") {
      context.name = eventType;

      // Add screen resolution
      var regex_firstDigits = /\d*/;
      if(typeof context.screen_resolution !== "undefined"){
        var m = context.screen_resolution.match(regex_firstDigits);
        if (m) {
            context.screen_width = m[0]
        }
      }

      envelops.push({
        url: config.plausible_domain+":"+config.plausible_port+"/api/event",
        method: "POST",
        headers: {
            "User-Agent": context.user_agent, // required
            "X-Forwarded-For": context.source_ip, // required
            "Content-Type": "application/json"
        },
        body: JSON.stringify(context)
      });
    }
    return envelops;
}

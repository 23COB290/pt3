<?php
require("lib/context.php");


function r_chat_channels(RequestContext $ctx, string $args) {
    
    if ($ctx->request_method == "GET") {
        $channels = db_channel_last_accessed_fetchall($ctx->session->hex_associated_user_id);
        respond_ok(array(
            "channels" => $channels
        ));
    } else if ($ctx->request_method == "PUT") {
        // add channel to recent list
    } else if ($ctx->request_method == "DELETE") {
        // remove channel from list
        // if groupchat leave & if last member delete
    }

}

function r_chat_channel(RequestContext $ctx, string $args) {
    if ($ctx->request_method == "GET") {
        // get channel info & members
    } else if ($ctx->request_method == "POST") {

        $ctx->body_require_fields_as_types([
            "type" => "integer",
        ]);
        $type = $ctx->request_body["type"];
        $employees = [];


        switch ($type) {
            case CHANNEL_TYPE_DM:
                $ctx->body_require_fields_as_types([
                    "recipient" => "string",
                ]);

                $name = "";
                $recipient = $ctx->request_body["recipient"];
                $employees = [$recipient, $ctx->session->hex_associated_user_id];
                break;
            case CHANNEL_TYPE_GROUP:

                // array members
                // name

                $ctx->body_require_fields_as_types([
                    "name" => "string",
                    "recipients" => "array",
                ]);

                $name = $ctx->request_body["name"];
                $employees = $ctx->request_body["recipients"];
                $employees[] = $ctx->session->hex_associated_user_id;
                break;
            default:
                respond_bad_request("Expected channel type to be either 0 or 1", ERROR_BODY_FIELD_INVALID_DATA);
        }

        // validate employees exist

        $binary_ids = array_map(function($id) {

            $bin_id = @hex2bin($id);
            if ($bin_id === false) {
                respond_bad_request("Expected all employee ids to be valid hex (offender: $id)", ERROR_BODY_FIELD_INVALID_DATA);
            }

            return $bin_id;
        }, array_unique($employees));

        $res = db_employee_fetch_by_ids($binary_ids);

        if ($res["requested"] != $res["found"]) {
            respond_bad_request("Invalid employee id in channel members", ERROR_RESOURCE_NOT_FOUND);
        }


        if ($type == CHANNEL_TYPE_GROUP && count($binary_ids) < 3) {
            respond_bad_request("Group chat must have at least 3 members", ERROR_BODY_FIELD_INVALID_DATA);
        }


        // create channel
        $channel_id = db_channel_new($name, $type);

        switch ($type) {
            case CHANNEL_TYPE_DM:
                // helper to ensure the channel is only created once
                db_channel_dm_bind_members($channel_id, $ctx->session->hex_associated_user_id, $recipient);
                break;
            case CHANNEL_TYPE_GROUP:
                // TODO: send new group message
                break;
        }

        db_channel_bind_members($channel_id, $employees);
        db_channel_set_last_accessed($channel_id, $ctx->session->hex_associated_user_id);

        respond_ok(array(
            "channel_id" => $channel_id
        ));
    }
}

register_route(new Route(
    ["GET", "PUT",],
    "/list",
    "r_chat_channels",
    1,
    []
));

register_route(new Route(
    ["GET", "POST", "DELETE"],
    "/channel",
    "r_chat_channel",
    1,
    [
        "URL_PATH_ARGS_LEGAL",
        "REQUIRES_BODY"
    ]
));


contextual_run();
?>

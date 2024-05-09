<?php
require("lib/context.php");
require_once("lib/object_commons/object_checks.php");


function r_chat_channels(RequestContext $ctx, string $args) {

    $args = explode_args_into_array($args);
    
    if ($ctx->request_method == "GET") {
        $channels = db_channel_last_accessed_fetchall($ctx->session->hex_associated_user_id);
        respond_ok(array(
            "channels" => $channels
        ));
    } else if ($ctx->request_method == "DELETE") {
        // remove channel from list
        // if groupchat leave & if last member delete

        object_check_solo_arg($ctx, $args);
        object_check_channel_exists($ctx, $args);
        object_check_user_in_channel($ctx, $args);

        $channel = $ctx->channel;

        if ($channel["type"] == CHANNEL_TYPE_GROUP) {
            db_message_new_system($channel["channelID"], $ctx->session->hex_associated_user_id, MESSAGE_TYPE_LEAVE);
            db_channel_unbind_member($channel["channelID"], $ctx->session->hex_associated_user_id);
        }
        db_channel_delete_last_accessed($channel["channelID"], $ctx->session->hex_associated_user_id);
        
        respond_no_content();

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

                $name = null;
                $recipient = $ctx->request_body["recipient"];

                if ($recipient == $ctx->session->hex_associated_user_id) {
                    respond_bad_request("Cannot create a DM with yourself", ERROR_BODY_FIELD_INVALID_DATA);
                }

                $existing = db_channel_dm_fetch($ctx->session->hex_associated_user_id, $recipient);

                if ($existing !== false) {
                    db_channel_set_last_accessed($existing, $ctx->session->hex_associated_user_id);
                    respond_ok(array(
                        "channel_id" => $existing
                    ));
                }

                $employees = [$recipient, $ctx->session->hex_associated_user_id];
                break;
            case CHANNEL_TYPE_GROUP:

                // array members
                // name

                $ctx->body_require_fields_as_types([
                    "recipients" => "array",
                ]);

                $ctx->body_require_fields_as_types([
                    "name" => "string",
                ], true);

                $name = $ctx->request_body["name"] ?? null;
                $employees = $ctx->request_body["recipients"];
                $employees[] = $ctx->session->hex_associated_user_id;
                break;
            default:
                respond_bad_request("Expected channel type to be either 0 or 1", ERROR_BODY_FIELD_INVALID_DATA);
        }

        if ($name !== null && strlen($name) > 254) {
            respond_bad_request("Channel name must be less than 254 characters", ERROR_BODY_FIELD_INVALID_DATA);
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
        $channel_id = db_channel_new($name, $type, $ctx->session->hex_associated_user_id);

        switch ($type) {
            case CHANNEL_TYPE_DM:
                // helper to ensure the channel is only created once
                db_channel_dm_bind_members($channel_id, $ctx->session->hex_associated_user_id, $recipient);


                db_channel_set_last_accessed($channel_id, $ctx->session->hex_associated_user_id);
                break;
            case CHANNEL_TYPE_GROUP:

                db_message_new_system($channel_id, $ctx->session->hex_associated_user_id, MESSAGE_TYPE_NEW_GROUP);

                db_channel_set_last_accessed_bulk($channel_id, $employees);
                break;
        }

        db_channel_bind_members($channel_id, $employees);

        respond_ok(array(
            "channel_id" => $channel_id
        ));
    }
}

register_route(new Route(
    ["GET", "DELETE"],
    "/list",
    "r_chat_channels",
    1,
    [
        "URL_PATH_ARGS_LEGAL"
    ]
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

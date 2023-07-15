import { Snowflake } from "discord.js";
import { Connection } from "mysql";

interface ReportBase {
    report_uuid: string,
    player_ign: string,
    video_url: string,
    status_id: 'pending' | 'banned' | 'denied' | 'reopened' | 'canceled',
    reporter_id: Snowflake,
    log_message_id?: Snowflake,
    status_message_id?: Snowflake,
    reporter_message: string
}

interface Report {
    id: number,
    report_uuid: string,
    created_at: string,
    updated_at: string,
    player_ign: string,
    video_url: string,
    status_id: 'pending' | 'banned' | 'denied' | 'reopened' | 'canceled',
    officer_id: Snowflake,
    reporter_id: Snowflake,
    log_message_id: Snowflake,
    status_message_id: Snowflake,
    reporter_message: string
}

interface DString {
    [index: string]: string
}

export type Interact = {
    id: string;
    permission: string;
    disable: boolean;
    execute(
        client: Client,
        args: Array,
        log: Logger,
        interaction: Interaction,
        db: Connection
    ): Promise<void>;
};
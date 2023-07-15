import { Logger } from 'log4js';
import { Connection } from 'mysql';
import { Report, ReportBase } from '../@types/types';

// SQL操作用
export class Controller {
    private db: Connection;
    private log: Logger;
    constructor(db: Connection, log: Logger) {
        this.db = db;
        this.log = log;
    }
    insertReport = (report: ReportBase) => {
        return new Promise<void>((resolve, reject) => {
            this.db.query(
                'insert into reports (report_uuid, player_ign, video_url, reporter_id, log_message_id, status_message_id, reporter_message) values (?, ?, ?, ?, ?, ?, ?);',
                [
                    report.report_uuid,
                    report.player_ign,
                    report.video_url,
                    report.reporter_id,
                    report.log_message_id,
                    report.status_message_id,
                    report.reporter_message,
                ],
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                }
            );
        });
    };
    getReport = (column: string, value: string): Promise<Report> => {
        return new Promise((resolve, reject) => {
            this.db.query(
                `select * from reports where ?? = ?`,
                [column, value],
                (error, results) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(results[0]);
                }
            );
        });
    };
    updateReport = (report: Report) => {
        return new Promise<void>((resolve, reject) => {
            this.db.query(
                `update reports set status_id=?, status_message_id=? where report_uuid=?;`,
                [
                    report.status_id,
                    report.status_message_id,
                    report.report_uuid,
                ],
                (error) => {
                    if (error) {
                        reject(error);
                    }
                    resolve();
                }
            );
        });
    };
}

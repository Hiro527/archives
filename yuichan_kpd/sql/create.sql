create table kpd.reports (
    id int(10) not null AUTO_INCREMENT primary key,
    report_uuid varchar(256) collate utf8mb4_unicode_ci not null,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    updated_at timestamp default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP not null,
    player_ign varchar(100) collate utf8mb4_unicode_ci not null,
    video_url text collate utf8mb4_unicode_ci not null,
    status_id varchar(10) collate utf8mb4_unicode_ci not null default 'pending',
    officer_id varchar(20),
    reporter_id varchar(20) not null,
    log_message_id varchar(20) not null,
    status_message_id varchar(20) not null,
    reporter_message text not null
    );

alter table reports add index player_ign(player_ign);
alter table reports add unique index report_uuid(report_uuid);
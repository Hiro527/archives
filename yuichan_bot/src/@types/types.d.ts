import { Client, Message, Interaction } from 'discord.js';
import { Logger } from 'log4js';

export type Command = {
    name: string;
    permission: string;
    help: string;
    disable: boolean;
    hidden: boolean;
    args: {
        must: string[];
        optional: string[];
    };
    execute(
        client: Client,
        logger: Logger,
        message: Message,
        args: string[]
    ): Promise<void>;
};

export type Interact = {
    id: string;
    permission: string;
    disable: boolean;
    execute(
        client: Client,
        logger: Logger,
        interaction: Interaction
    ): Promise<void>;
};

interface User {
    k: string;
    p: string;
}

interface UsersList {
    [index: string]: User
}

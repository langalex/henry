/// <reference types="lucia" />
declare global {
	namespace Lucia {
		type Auth = import('$lib/server/auth').Auth;
		type DatabaseUserAttributes = {
			email: string;
			name: string;
		};
		type DatabaseSessionAttributes = {};
	}

	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string;
				roles: string[];
			} | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};

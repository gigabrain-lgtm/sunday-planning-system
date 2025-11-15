CREATE TABLE "clickup_clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clickup_clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"clickup_task_id" varchar(64) NOT NULL,
	"clickup_url" text,
	"client_name" text NOT NULL,
	"brand_name" text,
	"company" text,
	"status" varchar(64),
	"defcon" integer DEFAULT 3 NOT NULL,
	"am_owner" text,
	"ppc_owner" text,
	"creative_owner" text,
	"pod_owner" text,
	"total_asins_fam" text,
	"total_asins_ppc" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clickup_clients_clickup_task_id_unique" UNIQUE("clickup_task_id")
);

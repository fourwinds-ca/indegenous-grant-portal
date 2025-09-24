CREATE TABLE "grants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"agency" varchar(200),
	"program" varchar(200),
	"category" varchar(100),
	"eligibility" text,
	"application_link" varchar(1000),
	"deadline" date,
	"amount" numeric,
	"currency" varchar(3) DEFAULT 'CAD',
	"status" varchar(50) DEFAULT 'active',
	"source_url" varchar(1000),
	"scraped_at" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"metric_type" varchar(100) NOT NULL,
	"value" numeric,
	"date" date NOT NULL,
	"grant_id" uuid,
	"application_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reporting_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"requirement_type" varchar(100) NOT NULL,
	"description" text,
	"due_date" date,
	"completed" boolean DEFAULT false,
	"submission_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scraped_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" varchar(1000) NOT NULL,
	"domain" varchar(200),
	"last_scraped" timestamp DEFAULT now(),
	"success" boolean DEFAULT true,
	"error_message" text,
	"grants_found" integer DEFAULT 0,
	CONSTRAINT "scraped_sources_url_unique" UNIQUE("url")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_grant_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"grant_id" uuid NOT NULL,
	"application_status" varchar(50) DEFAULT 'planning',
	"application_date" date,
	"submission_date" date,
	"response_date" date,
	"amount_requested" numeric,
	"amount_approved" numeric,
	"notes" text,
	"documents" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_grant_id_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_application_id_user_grant_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."user_grant_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reporting_requirements" ADD CONSTRAINT "reporting_requirements_application_id_user_grant_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."user_grant_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_grant_applications" ADD CONSTRAINT "user_grant_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_grant_applications" ADD CONSTRAINT "user_grant_applications_grant_id_grants_id_fk" FOREIGN KEY ("grant_id") REFERENCES "public"."grants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
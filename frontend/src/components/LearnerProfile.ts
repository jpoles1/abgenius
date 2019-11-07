export interface LearnerProfile {
	id?: string;
	pubid?: string;
	uname?: string;
	fullName?: string;
	email?: string;
	authProivder?: string;
	learnerLevel?: string;
	learnerLevelYears?: number;
	isAdmin: boolean;
	isOwner: boolean;
	acceptedTOS: boolean;
}

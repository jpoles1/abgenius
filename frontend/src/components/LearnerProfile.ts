export const TrainingLevels = ["Undergraduate", "Medical School", "Residency", "Fellowship", "Attending", "Nursing School", "NP", "RN", "Other"];

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

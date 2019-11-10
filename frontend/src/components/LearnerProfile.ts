export const TrainingLevels = ["Undergraduate", "Medical Student", "Residency", "Fellowship", "Attending", "Nursing Student", "NP", "RN", "Other"];

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

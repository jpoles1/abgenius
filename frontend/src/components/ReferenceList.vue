<template>
	<div>
		<h2>References</h2>
		<ol class="reference-list">
			<li v-for="(ref, refID) in mainRefs" :key="refID">
				<a :href="ref.url" target="_blank">
					{{ref.name}}
				</a>
			</li>
		</ol>
		<br><br>
		<h2>Other Learning Resources</h2>
		<ul class="reference-list">
			<li v-for="(ref, refID) in extraRefs" :key="refID">
				<a :href="ref.url" target="_blank">
					{{ref.name}}
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { MainRefManager, ExtraRefManager } from "./References";
interface ResourceData {
	name?: string;
	url?: string;
	notes?: string;
}

export default {
	data() {
		return {
			mainRefs: MainRefManager.refList,
			extraRefs: ExtraRefManager.refList,
		};
	},
};
</script>

<style scoped>
	.reference-list a{
		color: white;
		text-decoration: none;
		transition: 600ms;
	}
	.reference-list a:hover{
		/*color: #e7ea78;*/
		color: #f6aeae;
		text-decoration: underline;
	}
	.reference-list li{
		margin-bottom: 4px;
	}
</style>


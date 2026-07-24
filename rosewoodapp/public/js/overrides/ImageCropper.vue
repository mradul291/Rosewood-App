<template>
	<div>
		<div>
			<img ref="image_ref" :src="src" :alt="file.name" />
		</div>
		<div class="image-cropper-actions">
			<div>
				<div class="btn-group" v-if="fixed_aspect_ratio == null">
					<button
						v-for="button in aspect_ratio_buttons"
						type="button"
						class="btn btn-default btn-sm"
						:class="{
							active: isNaN(aspect_ratio)
								? isNaN(button.value)
								: button.value === aspect_ratio,
						}"
						:key="button.label"
						@click="aspect_ratio = button.value"
					>
						{{ button.label }}
					</button>
				</div>
			</div>
			<div>
				<button
					class="btn btn-sm margin-right"
					@click="emit('toggle_image_cropper')"
					v-if="fixed_aspect_ratio == null"
				>
					{{ __("Back") }}
				</button>
				<button class="btn btn-primary btn-sm" @click="crop_image">
					{{ __("Crop") }}
				</button>
                // rotation button
                <button class="btn btn-default btn-sm me-2" @click="rotateLeft">
                    Rotate Left
                </button>

                <button class="btn btn-default btn-sm" @click="rotateRight">
                    Rotate Right
                </button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Cropper from "cropperjs";
import FileUploader from "./frappe/file_uploader/FileUploader.vue";

// props
const props = defineProps({
	file: Object,
	fixed_aspect_ratio: Number,
});

// emits
let emit = defineEmits(["toggle_image_cropper"]);

// variables
let aspect_ratio = ref(props.fixed_aspect_ratio != null ? props.fixed_aspect_ratio : NaN);
let src = ref(null);
let cropper = ref(null);
let image = ref(null);
let image_ref = ref(null); // Template ref

// methods
function crop_image() {
	props.file.crop_box_data = cropper.value.getData();
	const canvas = cropper.value.getCroppedCanvas();
	const file_type = props.file.file_obj.type;
	canvas.toBlob((blob) => {
		var cropped_file_obj = new File([blob], props.file.name, {
			type: blob.type,
		});
		props.file.file_obj = cropped_file_obj;
		emit("toggle_image_cropper");
	}, file_type);
    // method addition
    rotateLeft() {
        this.cropper?.rotate(-90);
    },

    rotateRight() {
        this.cropper?.rotate(90);
    },
}

// mounted
onMounted(() => {
	if (window.FileReader) {
		let fr = new FileReader();
		fr.onload = () => (src.value = fr.result);
		fr.readAsDataURL(props.file.cropper_file);
	}
	let crop_box = props.file.crop_box_data;
	image.value = image_ref.value;
	image.value.onload = () => {
		cropper.value = new Cropper(image.value, {
			zoomable: false,
			scalable: false,
			viewMode: 1,
			data: crop_box,
			aspectRatio: aspect_ratio.value,
		});
		window.cropper = cropper.value;
	};
});

//  computed
let aspect_ratio_buttons = computed(() => {
	return [
		{
			label: __("1:1", null, "Image Cropper"),
			value: 1,
		},
		{
			label: __("4:3", null, "Image Cropper"),
			value: 4 / 3,
		},
		{
			label: __("16:9", null, "Image Cropper"),
			value: 16 / 9,
		},
		{
			label: __("Free", null, "Image Cropper"),
			value: NaN,
		},
	];
});

// watcher
watch(
	aspect_ratio,
	(value) => {
		if (cropper.value) {
			cropper.value.setAspectRatio(value);
		}
	},
	{ deep: true }
);
</script>

<style scoped>
@import "cropperjs/dist/cropper.min.css";
img {
	display: block;
	max-width: 100%;
	max-height: 600px;
}

.image-cropper-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: var(--margin-md);
}
</style>





<template>
	<div>
		<div>
			<img ref="image_ref" :src="src" :alt="file.name" />
		</div>

		<div class="image-cropper-actions">
			<div>
				<div class="btn-group" v-if="fixed_aspect_ratio == null">
					<button
						v-for="button in aspect_ratio_buttons"
						type="button"
						class="btn btn-default btn-sm"
						:class="{
							active: isNaN(aspect_ratio)
								? isNaN(button.value)
								: button.value === aspect_ratio,
						}"
						:key="button.label"
						@click="aspect_ratio = button.value"
					>
						{{ button.label }}
					</button>
				</div>
			</div>

			<div class="d-flex gap-2">
				<button
					class="btn btn-default btn-sm"
					@click="rotateLeft"
				>
					{{ __('Rotate Left') }}
				</button>

				<button
					class="btn btn-default btn-sm"
					@click="rotateRight"
				>
					{{ __('Rotate Right') }}
				</button>

				<button
					class="btn btn-sm margin-right"
					@click="emit('toggle_image_cropper')"
					v-if="fixed_aspect_ratio == null"
				>
					{{ __("Back") }}
				</button>

				<button class="btn btn-primary btn-sm" @click="crop_image">
					{{ __("Crop") }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import Cropper from "cropperjs";

// props
const props = defineProps({
	file: Object,
	fixed_aspect_ratio: Number,
});

// emits
const emit = defineEmits(["toggle_image_cropper"]);

// refs
const aspect_ratio = ref(
	props.fixed_aspect_ratio != null
		? props.fixed_aspect_ratio
		: NaN
);

const src = ref(null);
const cropper = ref(null);
const image_ref = ref(null);

// crop image
function crop_image() {
	props.file.crop_box_data = cropper.value.getData();

	const canvas = cropper.value.getCroppedCanvas();

	const file_type = props.file.file_obj.type;

	canvas.toBlob((blob) => {
		const cropped_file_obj = new File(
			[blob],
			props.file.name,
			{
				type: blob.type,
			}
		);

		props.file.file_obj = cropped_file_obj;

		emit("toggle_image_cropper");
	}, file_type);
}

// rotate left
function rotateLeft() {
	if (cropper.value) {
		cropper.value.rotate(-90);
	}
}

// rotate right
function rotateRight() {
	if (cropper.value) {
		cropper.value.rotate(90);
	}
}

// mounted
onMounted(() => {
	if (window.FileReader) {
		const fr = new FileReader();

		fr.onload = () => {
			src.value = fr.result;
		};

		fr.readAsDataURL(props.file.cropper_file);
	}

	const crop_box = props.file.crop_box_data;

	const initCropper = () => {
		cropper.value = new Cropper(image_ref.value, {
			zoomable: false,
			scalable: false,
			viewMode: 1,
			data: crop_box,
			aspectRatio: aspect_ratio.value,
		});
	};

	if (image_ref.value.complete) {
		initCropper();
	} else {
		image_ref.value.onload = initCropper;
	}
});

// computed
const aspect_ratio_buttons = computed(() => {
	return [
		{
			label: __("1:1", null, "Image Cropper"),
			value: 1,
		},
		{
			label: __("4:3", null, "Image Cropper"),
			value: 4 / 3,
		},
		{
			label: __("16:9", null, "Image Cropper"),
			value: 16 / 9,
		},
		{
			label: __("Free", null, "Image Cropper"),
			value: NaN,
		},
	];
});

// watch
watch(aspect_ratio, (value) => {
	if (cropper.value) {
		cropper.value.setAspectRatio(value);
	}
});
</script>

<style scoped>
@import "cropperjs/dist/cropper.min.css";

img {
	display: block;
	max-width: 100%;
	max-height: 600px;
}

.image-cropper-actions {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: var(--margin-md);
}
</style>
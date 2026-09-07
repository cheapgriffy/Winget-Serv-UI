<template>
    <button class="shell-mode-toggle" type="button" :aria-label="`Switch shell mode. Current mode: ${mode}`"
        :title="`Switch to ${nextMode}`" @click="$emit('update:mode', nextMode)">
        <span class="mode-prompt">&gt;_</span>
        <span class="mode-name">{{ mode }}</span>
        <span class="mode-switch" aria-hidden="true">&#8644;</span>
    </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    mode: { type: String, required: true }
})

defineEmits(['update:mode'])

const nextMode = computed(() => props.mode === 'Powershell' ? 'Bash' : 'Powershell')
</script>

<style scoped>
.shell-mode-toggle {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 144px;
    justify-content: center;
    padding: 7px 12px;
    background: var(--bg-2);
    border: 1px solid var(--border-bright);
    border-radius: var(--radius);
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    transition: color var(--transition), border-color var(--transition), background var(--transition);
}

.shell-mode-toggle:hover,
.shell-mode-toggle:focus-visible {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-dim);
    outline: none;
}

.mode-prompt {
    color: var(--accent);
    font-size: 11px;
}

.mode-name {
    min-width: 65px;
}

.mode-switch {
    color: var(--text-dim);
    font-size: 13px;
}

@media (max-width: 520px) {
    .shell-mode-toggle {
        min-width: 0;
        padding: 7px 9px;
    }

    .mode-prompt,
    .mode-switch {
        display: none;
    }

    .mode-name {
        min-width: 0;
    }
}
</style>

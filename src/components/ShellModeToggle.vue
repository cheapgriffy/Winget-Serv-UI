<template>
    <div class="shell-mode-toggle" role="group" aria-label="Shell mode">
        <button type="button" :class="['mode-option', { active: mode === 'Powershell' }]"
            :aria-pressed="mode === 'Powershell'" @click="$emit('update:mode', 'Powershell')">
            POWERSHELL
        </button>
        <button type="button" :class="['mode-option', { active: mode === 'Bash' }]" :aria-pressed="mode === 'Bash'"
            @click="$emit('update:mode', 'Bash')">
            BASH
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    mode: { type: String, required: true }
})

defineEmits(['update:mode'])

</script>

<style scoped>
.shell-mode-toggle {
    display: inline-flex;
    align-items: stretch;
    padding: 3px;
    background: var(--bg-2);
    border: 1px solid var(--border-bright);
    border-radius: var(--radius);
    box-shadow: inset 0 0 0 1px var(--bg);
}

.mode-option {
    min-width: 88px;
    padding: 5px 10px;
    background: transparent;
    border: 0;
    border-radius: var(--radius);
    color: var(--text-muted);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    transition: color var(--transition), background var(--transition), box-shadow var(--transition);
}

.mode-option:hover,
.mode-option:focus-visible {
    color: var(--text);
    outline: none;
}

.mode-option.active {
    background: var(--accent);
    color: var(--bg);
    box-shadow: 0 0 10px var(--accent-glow);
}

.mode-option.active:hover,
.mode-option.active:focus-visible {
    background: #00cc70;
    color: var(--bg);
}

@media (max-width: 520px) {
    .mode-option {
        min-width: 0;
        padding: 5px 8px;
    }
}
</style>

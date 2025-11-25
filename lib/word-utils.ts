import { WordEntry, WordExample } from "@/types/word"

export const NORMALIZED_SUFFIXES = ["lah", "kah", "nya", "kan", "pun", "ku", "mu", "an", "in"]
export const NORMALIZED_PREFIXES = ["me", "mem", "men", "meng", "meny", "ber", "ter", "se", "ke", "pe", "pen", "peng", "per", "di"]

export function normalizeToken(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "")
}

export function stripAffixes(token: string): string {
    let current = token
    let changed = true
    while (changed) {
        changed = false
        for (const suffix of NORMALIZED_SUFFIXES) {
            if (current.endsWith(suffix) && current.length - suffix.length > 2) {
                current = current.slice(0, -suffix.length)
                changed = true
            }
        }
        for (const prefix of NORMALIZED_PREFIXES) {
            if (current.startsWith(prefix) && current.length - prefix.length > 2) {
                current = current.slice(prefix.length)
                changed = true
            }
        }
    }
    return current
}

export function buildWordTokens(word: WordEntry, includeForms = true): Set<string> {
    const tokens = new Set<string>()
    const push = (value: string) => {
        if (!value) return
        const normalized = normalizeToken(value)
        if (!normalized) return
        tokens.add(normalized)
        tokens.add(stripAffixes(normalized))
    }

    push(word.word)
    if (includeForms) {
        word.other_forms.forEach(form => push(form.word))
        word.similar_words.forEach(sim => push(sim.word))
    }

    const englishSources = [
        word.translation,
        ...word.alternative_translations.map(item => item.word),
        ...word.examples.map((item: WordExample) => item.translation),
    ]
    englishSources.forEach(source => {
        source
            .split(/[,/]/)
            .map(part => part.trim())
            .forEach(part => push(part))
    })

    return tokens
}

export function sanitizeWordJSON(content: string): string {
    const trimmed = content.trim()
    if (trimmed.startsWith("```")) {
        const parts = trimmed.split("```")
        return parts[1] || parts[2] || trimmed
    }
    return trimmed
}

export function validateWordEntry(entry: WordEntry): WordEntry {
    const merged: WordEntry = {
        ...entry,
        examples: entry.examples ?? [],
        alternative_translations: entry.alternative_translations ?? [],
        similar_words: entry.similar_words ?? [],
        other_forms: entry.other_forms ?? [],
        level: entry.level ?? "2",
        learned: entry.learned ?? false,
        type: entry.type ?? "Vocabulary",
        category: entry.category ?? "",
        notes: entry.notes ?? "",
        "q&a": entry["q&a"] ?? [],
    }

    if (!merged.word || !merged.translation) {
        throw new Error("Generated entry is missing required fields.")
    }

    return merged
}

export function tokenizeSentence(sentence: string): string[] {
    return sentence.match(/[\p{L}'-]+|[0-9]+|[^\p{L}0-9]+/gu) ?? []
}

export function isWordLikeToken(token: string): boolean {
    return /[\p{L}]/u.test(token)
}

export function cleanWordToken(token: string): string {
    return token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "")
}

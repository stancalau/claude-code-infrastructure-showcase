#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

interface HookInput {
    session_id: string;
    transcript_path: string;
    cwd: string;
    permission_mode: string;
    hook_event_name: string;
}

interface EditedFile {
    path: string;
    tool: string;
    timestamp: string;
}

function getFileCategory(filePath: string): 'step' | 'container' | 'page' | 'state' | 'feature' | 'test' | 'other' {
    const normalizedPath = filePath.replace(/\\/g, '/');

    if (normalizedPath.includes('/steps/') || normalizedPath.includes('Steps.java') || normalizedPath.includes('StepDefs.java')) return 'step';
    if (normalizedPath.includes('/container/') || normalizedPath.includes('Container.java')) return 'container';
    if (normalizedPath.includes('/page/') || normalizedPath.includes('Page.java')) return 'page';
    if (normalizedPath.includes('/state/') || normalizedPath.includes('StateManager.java')) return 'state';
    if (normalizedPath.endsWith('.feature')) return 'feature';
    if (normalizedPath.includes('/test/') || normalizedPath.includes('Test.java')) return 'test';

    return 'other';
}

function shouldCheckTestQuality(filePath: string): boolean {
    return filePath.match(/\.java$/) !== null || filePath.match(/\.feature$/) !== null;
}

function analyzeFileContent(filePath: string): {
    hasLogging: boolean;
    hasAfterHook: boolean;
    hasAssertions: boolean;
    hasStepDefinition: boolean;
    hasContainerCleanup: boolean;
    hasWaitStrategy: boolean;
} {
    if (!existsSync(filePath)) {
        return { hasLogging: false, hasAfterHook: false, hasAssertions: false, hasStepDefinition: false, hasContainerCleanup: false, hasWaitStrategy: false };
    }

    const content = readFileSync(filePath, 'utf-8');

    return {
        hasLogging: /@Slf4j|private.*Logger|LoggerFactory|log\./.test(content),
        hasAfterHook: /@After\b|@AfterAll|@AfterEach/.test(content),
        hasAssertions: /assertThat|assertEquals|assertTrue|assertFalse|assertNotNull|Assertions\./.test(content),
        hasStepDefinition: /@Given|@When|@Then|@And|@But/.test(content),
        hasContainerCleanup: /\.stop\(\)|\.close\(\)|cleanup\(|teardown/.test(content),
        hasWaitStrategy: /waitingFor|Wait\.for|WebDriverWait|ExpectedConditions/.test(content),
    };
}

async function main() {
    try {
        const input = readFileSync(0, 'utf-8');
        const data: HookInput = JSON.parse(input);

        const { session_id } = data;
        const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();

        const cacheDir = join(homedir(), '.claude', 'tsc-cache', session_id);
        const trackingFile = join(cacheDir, 'edited-files.log');

        if (!existsSync(trackingFile)) {
            process.exit(0);
        }

        const trackingContent = readFileSync(trackingFile, 'utf-8');
        const editedFiles = trackingContent
            .trim()
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => {
                const [timestamp, tool, path] = line.split('\t');
                return { timestamp, tool, path };
            });

        if (editedFiles.length === 0) {
            process.exit(0);
        }

        const categories = {
            step: [] as string[],
            container: [] as string[],
            page: [] as string[],
            state: [] as string[],
            feature: [] as string[],
            test: [] as string[],
            other: [] as string[],
        };

        const analysisResults: Array<{
            path: string;
            category: string;
            analysis: ReturnType<typeof analyzeFileContent>;
        }> = [];

        for (const file of editedFiles) {
            if (!shouldCheckTestQuality(file.path)) continue;

            const category = getFileCategory(file.path);
            categories[category].push(file.path);

            const analysis = analyzeFileContent(file.path);
            analysisResults.push({ path: file.path, category, analysis });
        }

        const needsAttention = analysisResults.some(
            ({ analysis }) =>
                analysis.hasStepDefinition ||
                analysis.hasContainerCleanup !== undefined
        );

        if (!needsAttention || analysisResults.length === 0) {
            process.exit(0);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TEST QUALITY CHECK');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (categories.step.length > 0) {
            const stepFiles = analysisResults.filter(f => f.category === 'step');
            const hasLogging = stepFiles.some(f => f.analysis.hasLogging);
            const hasAfterHook = stepFiles.some(f => f.analysis.hasAfterHook);
            const hasAssertions = stepFiles.some(f => f.analysis.hasAssertions);

            console.log('Step Definition Changes Detected');
            console.log(`   ${categories.step.length} file(s) edited\n`);

            if (!hasLogging) {
                console.log('   ? Consider adding @Slf4j for logging');
            }
            if (!hasAfterHook) {
                console.log('   ? Is there an @After hook for cleanup?');
            }
            if (!hasAssertions) {
                console.log('   ? Are there proper assertions in @Then steps?');
            }

            console.log('\n   Best Practices:');
            console.log('      - Use @Slf4j for step logging');
            console.log('      - Clean up WebDriver/containers in @After');
            console.log('      - Use ScenarioContext for state sharing\n');
        }

        if (categories.container.length > 0) {
            const containerFiles = analysisResults.filter(f => f.category === 'container');
            const hasCleanup = containerFiles.some(f => f.analysis.hasContainerCleanup);
            const hasWaitStrategy = containerFiles.some(f => f.analysis.hasWaitStrategy);

            console.log('Container Changes Detected');
            console.log(`   ${categories.container.length} file(s) edited\n`);

            if (!hasCleanup) {
                console.log('   ? Is there proper container cleanup?');
            }
            if (!hasWaitStrategy) {
                console.log('   ? Consider adding wait strategies');
            }

            console.log('\n   Best Practices:');
            console.log('      - Use waitingFor() with health checks');
            console.log('      - Implement proper stop() methods');
            console.log('      - Use network aliases for inter-container communication\n');
        }

        if (categories.page.length > 0) {
            const pageFiles = analysisResults.filter(f => f.category === 'page');
            const hasWaitStrategy = pageFiles.some(f => f.analysis.hasWaitStrategy);

            console.log('Page Object Changes Detected');
            console.log(`   ${categories.page.length} file(s) edited\n`);

            if (!hasWaitStrategy) {
                console.log('   ? Are there proper WebDriver waits?');
            }

            console.log('\n   Best Practices:');
            console.log('      - Use explicit waits (WebDriverWait)');
            console.log('      - Avoid Thread.sleep()');
            console.log('      - Return Page objects for fluent API\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('TIP: Disable with SKIP_ERROR_REMINDER=1');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (err) {
        process.exit(0);
    }
}

main().catch(() => process.exit(0));

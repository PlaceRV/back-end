import {
	ExportedDeclarations,
	InterfaceDeclaration,
	Project,
	VariableDeclarationKind,
} from 'ts-morph';

const project = new Project(),
	sourceFiles = project.addSourceFilesAtPaths('src/**/*.ts'),
	modelsFile = project.createSourceFile('./src/models.ts', '', {
		overwrite: true,
	}),
	typesFile = project.createSourceFile('./src/types.ts', '', {
		overwrite: true,
	});

function createKeys(node: InterfaceDeclaration) {
	const allKeys = node
		.getProperties()
		.map((p) => p.getName())
		.sort((a, b) => a.localeCompare(b));
	modelsFile.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: `${node.getName()}Keys`,
				initializer: (writer) =>
					writer.write(`${JSON.stringify(allKeys)} as const`),
			},
		],
	});
}

const masterExportNames: string[] = [];
for (const sourceFile of sourceFiles) {
	if (/(build.ts|types.ts|models.ts)/.test(sourceFile.getBaseName())) continue;

	for (const intfce of sourceFile.getInterfaces()) createKeys(intfce);

	const exportNames: string[] = [];
	const exportDeclarations: ExportedDeclarations[] = [];
	for (const [
		exportName,
		declarations,
	] of sourceFile.getExportedDeclarations()) {
		exportNames.push(exportName);
		exportDeclarations.push(...declarations);
	}

	if (exportNames.length) {
		typesFile.addImportDeclaration({
			namedImports: exportNames,
			moduleSpecifier: `${sourceFile.getFilePath().split('src')[1].slice(1, -3)}`,
		});

		masterExportNames.push(...exportNames);
	}
}
typesFile.addExportDeclaration({ namedExports: masterExportNames });

modelsFile.saveSync();
typesFile.saveSync();

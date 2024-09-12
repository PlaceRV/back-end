import {
	ExportedDeclarations,
	InterfaceDeclaration,
	Project,
	SourceFile,
	ts,
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

function createKeys(node: InterfaceDeclaration, sourceFile: SourceFile) {
	function getInterface(node: any): string[] {
		if (node.getKind() !== ts.SyntaxKind.InterfaceDeclaration) return [];

		const extendedTypes = node
				.getExtends()
				.map((expr) => sourceFile.getInterface(expr.getExpression().getText())),
			extendedInterfaces: string[] = node
				.getProperties()
				.map((i) => i.getName());

		for (const extendedType of extendedTypes)
			extendedInterfaces.push(...getInterface(extendedType));

		return extendedInterfaces.filter(
			(item, index) => extendedInterfaces.indexOf(item) === index,
		);
	}

	const allKeys = getInterface(node).sort((a, b) => a.localeCompare(b));
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

	for (const intfce of sourceFile.getInterfaces())
		createKeys(intfce, sourceFile);

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

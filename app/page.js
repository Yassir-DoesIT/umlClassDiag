"use client";
import * as joint from 'jointjs';
import { useEffect, useState } from 'react';

const Page = () => {
    const [graph, setGraph] = useState(null);
    const [paper, setPaper] = useState(null);
    const [className, setClassName] = useState('');
    const [attributes, setAttributes] = useState('');
    const [language, setLanguage] = useState('Java');
    const [methods, setMethods] = useState('');
    const [classes, setClasses] = useState([]);
    const [relations, setRelations] = useState([]);
    const [sourceClass, setSourceClass] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [relationType, setRelationType] = useState('composition');
    const [generatedCode, setGeneratedCode] = useState('');
    const [selectedClassToDelete, setSelectedClassToDelete] = useState('');
    const [cardinalitySource, setCardinalitySource] = useState('');
    const [cardinalityTarget, setCardinalityTarget] = useState('');
    const [activeCard, setActiveCard] = useState("CardAjout");


    useEffect(() => {
        const newGraph = new joint.dia.Graph();
        const newPaper = new joint.dia.Paper({
            el: document.getElementById('myDiagram'),
            model: newGraph,
            width: 1030,
            height: 600,
            gridSize: 10,
        });

        setGraph(newGraph);
        setPaper(newPaper);
    }, []);

    const addClassToDiagram = (e) => {
        e.preventDefault();
        if (graph && paper) {
            const uml = joint.shapes.uml;

            const newClass = new uml.Class({
                position: { x: 100 + classes.length * 200, y: 50 },
                size: { width: 180, height: 150 },
                name: className,
                attributes: attributes.split('\n'),
                methods: methods.split('\n'),
            });

            graph.addCell(newClass);
            setClasses([...classes, { name: className, cell: newClass }]);
            setClassName('');
            setAttributes('');
            setMethods('');
        }
    };

const handleGenerateCode = (e) => {
    let generated;

    switch(language) {
        case 'Java' :
        generated = generateJavaCode(classes,relations);
        setGeneratedCode(generated);
        break;
        case 'PHP' :
        generated = generatePHPCode(classes);
        setGeneratedCode(generated);
        break;
        case 'Python' :
        generated = generatePythonCode(classes);
        setGeneratedCode(generated);
        default:
            break;
    }
}

    const addRelation = (e) => {
        e.preventDefault();
        if (graph && sourceClass && targetClass && relationType) {
            const source = classes.find((c) => c.name === sourceClass);
            const target = classes.find((c) => c.name === targetClass);

            if (source && target) {
                let link;

                switch (relationType) {
                    case 'composition':
                        link = new joint.shapes.uml.Composition({ source: { id: source.cell.id }, target: { id: target.cell.id }, labels: [
                            { position:1000, attrs: { text: { text: cardinalitySource || '' } } },
                            {   attrs: { text: { text: cardinalityTarget || '' } } },
                        ], });
                        link.relationPlaceholder = "composition";
                        break;
                    case 'aggregation':
                        link = new joint.shapes.uml.Aggregation({ source: { id: source.cell.id }, target: { id: target.cell.id }, labels: [
                            { position:100, attrs: { text: { text: cardinalitySource || '' } } },
                            {  attrs: { text: { text: cardinalityTarget || '' } } },
                        ], });
                        link.relationPlaceholder = "aggregation";
                        break;
                    case 'inheritance':
                        link = new joint.shapes.uml.Generalization({ source: { id: source.cell.id }, target: { id: target.cell.id } });
                        link.relationPlaceholder = "generalization";
                        break;
                    case 'association':
                    link = new joint.shapes.uml.Association({ source: { id: source.cell.id }, target: { id: target.cell.id }, labels: [
                        { position:100, attrs: { text: { text: cardinalitySource || '' } } },
                        {  attrs: { text: { text: cardinalityTarget || '' } } },
                    ], });
                    link.relationPlaceholder = "association";
                    break;
                    default:
                        break;
                }

                graph.addCell(link);
                setRelations([...relations, link])
            }
        }
    };


    const parseMethods = (methods) => {
        return methods.map((method) => {
            const methodRegex = /^([+\-#]?)([a-zA-Z0-9_]+)\((.*)\):?\s*([a-zA-Z0-9_<>]*)?$/;
            const match = method.match(methodRegex);
            if (match) {
                const [_, visibility, name, params, returnType] = match;
                return {
                    visibility: visibility === "+" ? "public" : visibility === "-" ? "private" : "protected",
                    name,
                    params,
                    returnType: returnType || "void",
                };
            }
            return null;
        }).filter(Boolean); // Filter out invalid methods
    };

    const parseAttributes = (attributes) => {
        return attributes.map((attribute) => {
            const attributeRegex = /^([+\-#]?)([a-zA-Z0-9_<>]+)\s+([a-zA-Z0-9_]+)$/;
            const match = attribute.match(attributeRegex);
            if (match) {
                const [_, visibility, type, name] = match;
                return {
                    visibility: visibility === "+" ? "public" : visibility === "-" ? "private" : "protected",
                    type,
                    name,
                };
            }
            return null;
        }).filter(Boolean); // Filter out invalid attributes
    };
    
    const generateJavaCode = (classes, relations) => {

        return classes.map((cls) => {
            const attributes = parseAttributes(cls.cell.attributes.attributes).map((attr) => 
            `    ${attr.visibility} ${attr.type} ${attr.name};`
        ).join("\n");
            const methods = parseMethods(cls.cell.attributes.methods).map((method) => `
        ${method.visibility} ${method.returnType} ${method.name}(${method.params}) {
            // TODO: Implement this method
        }
    `).join("\n");

   

        const generalizations = relations
        .filter((rel) =>{
        
            return (rel.relationPlaceholder === "generalization" && rel.attributes.source.id === cls.cell.attributes.id)
        } )
        .map((rel) =>{
            const classWanted = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
            return ` extends ${classWanted.name}`;
        }).join("");


        const aggregationsAndCompositions = relations
        .filter((rel) => {
        
           return (rel.relationPlaceholder === "aggregation" || rel.relationPlaceholder === "composition") && rel.attributes.source.id === cls.cell.attributes.id
                            })
       .map((rel) => {
        const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
       

        return `    private List<${clasNeeded.name}> ${classNeeded.name.toLowerCase()}s = new ArrayList<>();`} ).join("\n");
       console.log("agg and comp", aggregationsAndCompositions);

       const associations = relations
        .filter((rel) => {
        
           return (rel.relationPlaceholder === "association") && rel.attributes.source.id === cls.cell.attributes.id
                            })
       .map((rel) => {
        const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
       

        return `    private ${classNeeded.name} ${classNeeded.name.toLowerCase()};`} ).join("\n");
        console.log("associations in map", associations);
        return `
    public class ${cls.name}${generalizations} {
    ${attributes}
    ${associations}
    ${aggregationsAndCompositions}
    ${methods}
    }`;
        }).join("\n");
    };
    
    const generatePythonCode = (classes) => {
        return classes.map((cls) => {
            const attributes = parseAttributes(cls.cell.attributes.attributes).map((attr) => 
            `        self.${attr.name} = None  # Type: ${attr.type}`
        ).join("\n");
            const methods = parseMethods(cls.cell.attributes.methods).map((method) => `
        def ${method.name}(self, ${method.params}):
            
            pass
    `).join("\n");

    const generalizations = relations
        .filter((rel) =>{
        
            return (rel.relationPlaceholder === "generalization" && rel.attributes.source.id === cls.cell.attributes.id)
        } )
        .map((rel) =>{
            const classWanted = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
                
                return `(${classWanted.name})`}).join("");

    const aggregationsAndCompositions = relations
                .filter((rel) => {
                
                   return (rel.relationPlaceholder === "aggregation" || rel.relationPlaceholder === "composition") && rel.attributes.source.id === cls.cell.attributes.id
                                    })
               .map((rel) => {
                const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
                return `        self.${classNeeded.name.toLowerCase()}s = []`
                }).join("\n");

    const associations = relations
                .filter((rel) => {
                
                   return (rel.relationPlaceholder === "association") && rel.attributes.source.id === cls.cell.attributes.id
                                    })
               .map((rel) => {
                const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
                return `        self.${classNeeded.name.toLowerCase()} = None # Type : ${classNeeded.name}`
                }).join("\n");
            return `
    class ${cls.name}${generalizations}:
        def __init__(self):
    ${attributes}
    ${associations}
    ${aggregationsAndCompositions}
    ${methods}
    `;
        }).join("\n");
    };
    
    const generatePHPCode = (classes) => {
        return classes.map((cls) => {
            const attributes = parseAttributes(cls.cell.attributes.attributes).map((attr) => 
            `    ${attr.visibility} $${attr.name}; // Type: ${attr.type}`
        ).join("\n");
            const methods = parseMethods(cls.cell.attributes.methods).map((method) => `
        ${method.visibility} function ${method.name}(${method.params}) {
            // TODO: Implement this method
        }
    `).join("\n");
    const generalizations = relations
        .filter((rel) =>{
        
            return (rel.relationPlaceholder === "generalization" && rel.attributes.source.id === cls.cell.attributes.id)
        } )
        .map((rel) =>{
            const classWanted = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);

               return ` extends ${classWanted.name}`
            }).join("");

    const aggregationsAndCompositions = relations
            .filter((rel) => {
            
               return (rel.relationPlaceholder === "aggregation" || rel.relationPlaceholder === "composition") && rel.attributes.source.id === cls.cell.attributes.id
                                })
           .map((rel) => {
            const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
            return `    private $${classNeeded.name.toLowerCase()}s = array();`
        }).join("\n");
    const associations = relations
        .filter((rel) => {
        
           return (rel.relationPlaceholder === "association") && rel.attributes.source.id === cls.cell.attributes.id
                            })
       .map((rel) => {
        const classNeeded = classes.find( classIterator => classIterator.cell.attributes.id === rel.attributes.target.id);
        return `    private $${classNeeded.name.toLowerCase()}; // Type : ${classNeeded.name}`
    }).join("\n");
            return `
    class ${cls.name}${generalizations} {
    ${attributes}
    ${aggregationsAndCompositions}
    ${methods}
    }`;
        }).join("\n");
    };
    const deleteClass = (e) => {
        e.preventDefault();
        if (graph && selectedClassToDelete) {
            const classToDelete = classes.find((cls) => cls.name === selectedClassToDelete);
            if (classToDelete) {
                graph.removeCells([classToDelete.cell]);
                setClasses(classes.filter((cls) => cls.name !== selectedClassToDelete));
                setSelectedClassToDelete('');
            }
        }
    };
    

    const cards = {
        CardAjout : <form onSubmit={addClassToDiagram} className="bg-gray-100 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4">Ajouter une Classe UML</h2>
        <div className="mb-4">
            <label htmlFor="className" className="block text-sm font-medium text-gray-700">Nom de la Classe</label>
            <input
                type="text"
                id="className"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nom de la classe"
                required
            />
        </div>
        <div className="mb-4">
            <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">Attributs</label>
            <textarea
                id="attributes"
                value={attributes}
                onChange={(e) => setAttributes(e.target.value)}
                rows="3"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+type attribute"
            />
            <small className="text-gray-500">Séparer chaque attribut par un saut de ligne.</small>
        </div>
        <div className="mb-4">
            <label htmlFor="methods" className="block text-sm font-medium text-gray-700">Méthodes</label>
            <textarea
                id="methods"
                value={methods}
                onChange={(e) => setMethods(e.target.value)}
                rows="3"
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+method():returnType"
            />
            <small className="text-gray-500">Séparer chaque méthode par un saut de ligne.</small>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">Ajouter la Classe</button>
    </form>,

    CardSuppression : <form onSubmit={deleteClass} className="bg-gray-100 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
    <h2 className="text-2xl font-semibold text-center mb-4">Supprimer une Classe</h2>
    <div className="mb-4">
        <label htmlFor="classToDelete" className="block text-sm font-medium text-gray-700">Classe à Supprimer</label>
        <select
            id="classToDelete"
            value={selectedClassToDelete}
            onChange={(e) => setSelectedClassToDelete(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
        >
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
                <option key={cls.name} value={cls.name}>{cls.name}</option>
            ))}
        </select>
    </div>
    <button type="submit" className="w-full bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition">Supprimer la Classe</button>
</form>,

    CardRelation : <form onSubmit={addRelation} className="bg-gray-100 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
    <h2 className="text-2xl font-semibold text-center mb-4">Ajouter une Relation</h2>
    <div className="mb-4">
        <label htmlFor="sourceClass" className="block text-sm font-medium text-gray-700">Classe Source</label>
        <select
            id="sourceClass"
            value={sourceClass}
            onChange={(e) => setSourceClass(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
        >
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
                <option key={cls.name} value={cls.name}>{cls.name}</option>
            ))}
        </select>
    </div>
    <div className="mb-4">
        <label htmlFor="targetClass" className="block text-sm font-medium text-gray-700">Classe Cible</label>
        <select
            id="targetClass"
            value={targetClass}
            onChange={(e) => setTargetClass(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
        >
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
                <option key={cls.name} value={cls.name}>{cls.name}</option>
            ))}
        </select>
    </div>
    <div className="mb-4">
        <label htmlFor="relationType" className="block text-sm font-medium text-gray-700">Type de Relation</label>
        <select
            id="relationType"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value)}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
        >
            <option value="composition">Composition</option>
            <option value="aggregation">Agrégation</option>
            <option value="inheritance">Héritage</option>
            <option value="association">Association</option>
        </select>
    </div>
    <div className="mb-4">
    <label htmlFor="cardinalitySource" className="block text-sm font-medium text-gray-700">Cardinalité Source</label>
    <input
        type="text"
        id="cardinalitySource"
        value={cardinalitySource}
        onChange={(e) => setCardinalitySource(e.target.value)}
        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
</div>
<div className="mb-4">
    <label htmlFor="cardinalityTarget" className="block text-sm font-medium text-gray-700">Cardinalité Cible</label>
    <input
        type="text"
        id="cardinalityTarget"
        value={cardinalityTarget}
        onChange={(e) => setCardinalityTarget(e.target.value)}
        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
</div>
    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition">Ajouter la Relation</button>
</form>
    }    
   

    return (
        <div className="relative bg-zinc-800">
            <div className="h-screen grid grid-cols-[30%_70%]">
      {/* First Column */}
      <div className="bg-gray-200 p-4">
        <nav className="mb-4">
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full py-2 px-4 text-left rounded ${
                  activeCard === "CardAjout" ? "bg-blue-500 text-white" : "bg-white"
                }`}
                onClick={() => setActiveCard("CardAjout")}
              >
                Card Ajout
              </button>
            </li>
            <li>
              <button
                className={`w-full py-2 px-4 text-left rounded ${
                  activeCard === "CardSuppression" ? "bg-blue-500 text-white" : "bg-white"
                }`}
                onClick={() => setActiveCard("CardSuppression")}
              >
                Card Suppression
              </button>
            </li>
            <li>
              <button
                className={`w-full py-2 px-4 text-left rounded ${
                  activeCard === "CardRelation" ? "bg-blue-500 text-white" : "bg-white"
                }`}
                onClick={() => setActiveCard("CardRelation")}
              >
                Card Relation
              </button>
            </li>
          </ul>
        </nav>
        <div>{cards[activeCard]}</div>
      </div>

      <div className="bg-gray-100 p-4 space-y-4">
      <div id="myDiagram" className="border border-gray-300"></div>
      <div className="relative bg-zinc-800">
            <div className="flex flex-col items-center gap-8">
                <div className="flex gap-8">
                    {/* Existing Forms */}
                    {/* Add Language Selector and Generate Button */}
                    <form className="bg-gray-100 mt-1 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
                        <h2 className="text-2xl font-semibold text-center mb-4">Générer du Code</h2>
                        <div className="mb-4">
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700">Langage</label>
                            <select
                                id="language"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option value="Java">Java</option>
                                <option value="Python">Python</option>
                                <option value="PHP">PHP</option>
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleGenerateCode()}
                            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Générer le Code
                        </button>
                    </form>
                </div>
                {/* Display Generated Code */}
                {generatedCode && (
                    <textarea
                        readOnly
                        className="w-full bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-md text-sm text-gray-700"
                        rows="10"
                        value={generatedCode}
                    />
                )}
                
            </div>
        </div>
      </div>

                
            </div>
            
        </div>
    );
};

export default Page;

import FileType from "../FileType.js";
import ResourceImageParser from "./parser/ResourceImageParser.js";
import ResourceSpineAtlasParser from "./parser/ResourceSpineAtlasParser.js";
import ResourceSpineParser from "./parser/ResourceSpineParser.js";

const ResourceTypeAssocs = {
    [FileType.JSON]: [ ResourceSpineParser ],
    [FileType.ATLAS]: [ ResourceSpineAtlasParser ],
    [FileType.PNG]: [ ResourceImageParser ],
    [FileType.JPG]: [ ResourceImageParser ]
};

export default ResourceTypeAssocs;


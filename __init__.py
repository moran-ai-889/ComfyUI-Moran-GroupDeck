# 直接把节点类写在这里，绝对不会有导入错误
class GroupDeck:
    @classmethod
    def INPUT_TYPES(cls):
        return {"required": {}}

    RETURN_TYPES = ()
    FUNCTION = "noop"
    CATEGORY = "Moran/Utils"
    OUTPUT_NODE = False

    def noop(self):
        return ()

# 注册节点
NODE_CLASS_MAPPINGS = {"GroupDeck": GroupDeck}
NODE_DISPLAY_NAME_MAPPINGS = {"GroupDeck": "★ 墨染组控台 (多面板分组)"}

# 前端目录
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
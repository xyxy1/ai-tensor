<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="6" class="tree-container">
        <el-input placeholder="输入关键字进行过滤" v-model="filterText">
        </el-input>
        <div class="labelList" v-for="(data,index) in treeData" :key="index">
          <span class="custom-tree-node">
            <el-tooltip :content="''+ data.parentFullName" placement="top">
              <span @click="handleNodeClick(data)">{{ data.label }}</span>
            </el-tooltip>
            <span>
              <el-button type="text" size="mini" @click="()=>createDialog(data)">
                <svg-icon iconClass="add"></svg-icon>
              </el-button>
            </span>
          </span>
        </div>
      </el-col>
      <el-col :span="18">
        <div class="filter-bar">
          <el-form :inline="true" :model="filter" ref="filterForm" class="demo-form-inline">
            <el-form-item label="关键字">
              <div class="picture-btn-wrap">
                <picture-search ref="pictureSearch" size="mini" style="width: 200px;" placeholder="名称/编码" @change="onSearchChange"></picture-search>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button size="mini" type="primary" @click="onSearch">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="mini" @click="onResetForm">重置</el-button>
            </el-form-item>
            <el-form-item>
              <el-button size="mini" type="default" @click="handleReset">清除</el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 工具栏 -->
        <div class="common-tool">
          <div class="title">
            乡镇街道
            <em>{{total?total:0}}</em>
          </div>
          <div class="re-right">
            <el-button class="txt-btn" size="mini" icon="el-icon-delete" type="text" @click="onItemDelete">删除</el-button>
          </div>
        </div>
        <el-table :data="list" v-loading="loading" height="calc(100vh - 335px)" style="width: 100%" @selection-change="onListChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="code" label="代码" min-width="120px">
          </el-table-column>
          <el-table-column prop="name" label="名称" min-width="100px">
          </el-table-column>
          <el-table-column prop="type" label="类型" min-width="80px">
          </el-table-column>

          <el-table-column prop="flag" label="启用" min-width="80px">
          </el-table-column>
          <el-table-column prop="crtName" label="创建人" min-width="100px">
          </el-table-column>
          <el-table-column prop="crtTime" label="创建时间" min-width="160px">
          </el-table-column>
          <el-table-column prop="udpName" label="修改人" min-width="100px">
          </el-table-column>

          <el-table-column prop="updTime" label="修改时间" min-width="160px">
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="180">
            <template slot-scope="scope">
              <a href="javascript:;" class="table-editor" @click="handleDialog(scope.row)">编辑</a>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="filter.offset" :page-sizes="[10, 20, 30, 50]" :page-size="filter.limit" layout="total,sizes, prev, pager, next, jumper" :total="total" style="margin-top: 15px">
        </el-pagination>
      </el-col>
    </el-row>
    <el-dialog title="乡镇街道" :visible.sync="dialogFormVisible">
      <el-form :model="newForm" :rules="rules" ref="form" label-width="180px">
        <el-form-item label="上级" prop="xzqName">
          <span v-text="newForm.xzqName"></span>
        </el-form-item>
        <el-form-item label="代码" prop="code">
          <el-input v-model="newForm.code" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="newForm.name" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="别名" prop="alias">
          <el-input v-model="newForm.alias" placeholder=""></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="newForm.type" placeholder="请选择">
            <el-option label="乡" value=1>
            </el-option>
            <el-option label="镇" value=2>
            </el-option>
            <el-option label="街道" value=3>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启用/禁用" prop="flag">
          <el-switch v-model="newForm.flag" active-color="#C9C9C9" inactive-color="#13ce66" active-text="禁用" inactive-text="启用" :active-value="'0'" :inactive-value="'1'" :disabled="!!newForm.id">
          </el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel('form')">取 消</el-button>
        <el-button v-if="newForm.id" type="primary" @click="handleUpdate('form')">确 定</el-button>
        <el-button v-else type="primary" @click="handleCreate('form')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import SvgIcon from "../../components/SvgIcon/index";
import { getObj, delObj } from "@/api/district/towns";
export default {
  components: { SvgIcon },
  name: "district-towns",
  data() {
    return {
      currentNode: {},
      loading: false,
      listIds: [],
      list: [],
      cachedTreeData: [],
      total: 0,
      newForm: {
        code: "",
        name: "",
        alias: "",
        type: undefined,
        xzqCode: "",
        xzqName: "",
        flag: 0
      },
      rules: {
        code: [
          {
            required: true,
            message: "请输入代码",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        name: [
          {
            required: true,
            message: "请输入名称",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        type: [
          {
            required: true,
            message: "请输入类型 ",
            trigger: "blur"
          }
        ],
        xzqCode: [
          {
            required: true,
            message: "请输入上级代码",
            trigger: "blur"
          },
          {
            min: 3,
            max: 20,
            message: "长度在 3 到 20 个字符",
            trigger: "blur"
          }
        ],
        flag: [
          {
            required: true,
            message: "请输入1启用 0禁用",
            trigger: "blur"
          }
        ]
      },
      dialogFormVisible: false,
      aiXzqManager_btn_edit: false,
      aiXzqManager_btn_del: false,
      aiXzqManager_btn_add: false,
      treeData: [],
      filterText: "",
      filter: {
        limit: 20,
        offset: 1,
        xzqCode: "",
        keyword: ""
      }
    };
  },
  created() {
    this.fetchTree();
    this.fetchData();
  },
  computed: {
    ...mapGetters(["elements"])
  },
  watch: {
    filterText(val) {
      this.filterList(val);
    }
  },
  methods: {
    fetchData() {
      this.loading = true;
      this.$store
        .dispatch("towns/query", this.filter)
        .then(payload => {
          this.loading = false;
          if (payload.status === 200) {
            this.list = payload.data.rows;
            this.total = payload.data.total;
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    // 关键字搜索框
    onSearchChange(val, img) {
      this.filter.keyword = val;
      this.filter.image = img;
    },
    // 重置按钮
    onResetForm() {
      // this.filter = {
      //   keyword: '',
      //   image: '',
      // };
      this.$refs.pictureSearch.reset();
    },
    // 更新列表选中
    onListChange(val) {
      this.listIds = val.map(item => item.id);
    },
    // 批量删除
    onItemDelete() {
      if (!this.listIds.length) {
        this.$notify({
          title: "提示",
          message: "请选择需要删除的数据",
          type: "warning",
          duration: 2000
        });
        return;
      }

      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonClass: "el-button--mini",
        cancelButtonClass: "el-button--mini fr",
        type: "warning"
      }).then(() => {
        delObj({
          ids: this.listIds
        }).then(res => {
          let isSuccess = res.status === 200;
          this.$notify({
            title: isSuccess ? "成功" : "失败",
            message: isSuccess ? "删除成功" : res.message,
            type: isSuccess ? "success" : "error",
            duration: 2000
          });

          if (isSuccess) {
            this.onSearch();
          }
        });
      });
    },
    fetchTree() {
      this.$store.dispatch("towns/tree").then(payload => {
        this.cachedTreeData = this.treeData = payload.data.rows;
      });
    },
    handleNodeClick(data, node) {
      this.filter.xzqCode = data.code;
      this.fetchData();
    },
    filterList(keywords) {
      if (keywords) {
        let filteredList = [];
        for (let row of this.treeData) {
          if (row.label.indexOf(keywords) !== -1) {
            filteredList.push(row);
          }
        }
        this.treeData = filteredList;
      } else {
        this.treeData = this.cachedTreeData;
      }
    },
    onSearch() {
      this.loading = true;
      this.$store
        .dispatch("towns/query", { ...this.filter, offset: 1 })
        .then(payload => {
          this.loading = false;
          if (payload.status === 200) {
            this.list = payload.data.rows;
            this.total = payload.data.total;
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    handleReset() {
      this.$refs.filterForm.resetFields();
      this.filter = {
        ...this.filter,
        code: "",
        name: ""
      };
      this.fetchData();
    },
    handleDialog(data) {
      getObj(data.id).then(response => {
        this.newForm = response.data;
      });
      this.dialogFormVisible = true;
    },
    createDialog(data) {
      this.newForm.xzqCode = data.code;
      this.newForm.xzqName = data.label;
      this.dialogFormVisible = true;
    },
    handleDelete(id) {
      this.$confirm("此操作将永久删除, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$store.dispatch("towns/remove", id).then(payload => {
          if (payload.status === 200) {
            this.fetchData();
          } else {
            this.$message({
              type: "warning",
              message: payload.message
            });
          }
        });
      });
    },
    handleCreate(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.$store
            .dispatch("towns/create", this.newForm)
            .then(payload => {
              if (payload.status === 200) {
                this.handleCancel(form);
                this.fetchData();
                this.$message({
                  message: "操作成功",
                  type: "success"
                });
              } else {
                this.$message({
                  type: "warning",
                  message: payload.message
                });
              }
            })
            .catch(err => {});
        } else {
          return false;
        }
      });
    },
    handleCancel(formName) {
      this.dialogFormVisible = false;
      const set = this.$refs;
      set[formName].resetFields();
      this.newForm = {
        code: "",
        name: "",
        alias: "",
        type: undefined,
        xzqCode: "",
        xzqName: "",
        flag: 0
      };
    },
    handleUpdate(form) {
      this.loading = true;
      this.$refs[form].validate(valid => {
        if (valid) {
          this.$store
            .dispatch("towns/patch", this.newForm)
            .then(payload => {
              if (payload.status === 200) {
                this.loading = false;
                this.handleCancel(form);
                this.fetchData();
                this.$message({
                  message: "操作成功",
                  type: "success"
                });
              } else {
                this.$message({
                  type: "warning",
                  message: payload.message
                });
              }
            })
            .catch(err => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    handleCurrentChange(page) {
      this.filter.offset = page;
      this.fetchData();
    },
    handleSizeChange(size) {
      this.filter.limit = size;
      this.fetchData();
    },
    handleUpdateFlag(record) {
      let opt = record.flag === "是" ? "禁用" : "启用";
      let flag = record.flag === "是" ? 0 : 1;
      this.$confirm(`此操作将${opt}${record.name}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        this.$store
          .dispatch("towns/updateFlag", { code: record.code, flag })
          .then(payload => {
            if (payload.status === 200) {
              this.$message({
                type: "success",
                message: "操作成功"
              });
              this.fetchData();
            } else {
              this.$message({
                type: "warning",
                message: payload.message
              });
            }
          });
      });
    }
  }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.fixed-table {
  height: 500px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
  .el-button {
    padding: 0;
  }
}

.dialog-footer {
  text-align: center;
}

.labelList {
  cursor: pointer;
}

.el-form-item {
  margin-bottom: 12px;
  margin-right: 3px;
}
</style>

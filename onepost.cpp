#include <iostream>
#include <fstream>
#include <filesystem>
#include <ctime>
#include <string>
#include <cstdlib>
#include <chrono>

namespace fs = std::filesystem;

int main() {
    // 获取 UTC+8 时间（VPS 是 UTC+0）
    std::time_t now = std::time(nullptr) + 8 * 3600; // 手动加上8小时偏移
    std::tm* ltm = std::gmtime(&now);

    char timestamp[15];
    std::strftime(timestamp, sizeof(timestamp), "%Y%m%d%H%M%S", ltm);

    std::string filename = timestamp;
    std::string home = std::getenv("HOME");
    std::string directory = home + "/vitetwitter/posts/";
    std::string path = directory + filename;

    // 创建目录
    fs::create_directories(directory);

    // 输入一句话
    std::cout << "说句话就好（回车保存）：";
    std::string line;
    std::getline(std::cin, line);

    // 写入 UTF-8 帖子内容
    std::ofstream file(path);
    if (file.is_open()) {
        file << line << std::endl;
        file.close();
        std::cout << "已写入：" << filename << std::endl;
    } else {
        std::cerr << "无法写入文件。" << std::endl;
        return 1;
    }

    // 追加到 posts.txt
    std::ofstream index((directory + "posts.txt"), std::ios::app);
    if (index.is_open()) {
        index << filename << std::endl;
        index.close();
    } else {
        std::cerr << "无法写入 posts.txt" << std::endl;
        return 1;
    }

    // 自动 git 提交 & 推送
    std::string repo = home + "/vitetwitter";
    std::string gitcmd = "cd " + repo + " && git pull && git add . && git commit -m \"帖子\" && git push";
    std::system(gitcmd.c_str());

    return 0;
}

